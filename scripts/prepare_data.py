#!/usr/bin/env python3
"""
Parse the GES CSV (2013-2024) and extract 2025 data from PDFs,
then merge into a single data.json for the webapp.
"""

import csv
import json
import re
import pdfplumber
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR
OUTPUT_PATH = BASE_DIR / "app" / "src" / "data" / "data.json"

CSV_FILE = DATA_DIR / "GraduateEmploymentSurveyNTUNUSSITSMUSUSSSUTD.csv"

PDF_FILES = {
    "Nanyang Technological University": DATA_DIR / "Web Publication NTU GES 2025.pdf",
    "National University of Singapore": DATA_DIR / "Web Publication NUS GES 2025.pdf",
    "Singapore Institute of Technology": DATA_DIR / "Web Publication SIT GES 2025.pdf",
    "Singapore Management University": DATA_DIR / "Web Publication SMU GES 2025.pdf",
    "Singapore University of Social Sciences": DATA_DIR / "Web Publication SUSS GES 2025.pdf",
    "Singapore University of Technology and Design": DATA_DIR / "Web Publication SUTD GES 2025.pdf",
}

CSV_COLUMNS = [
    "year", "university", "school", "degree",
    "employment_rate_overall", "employment_rate_ft_perm",
    "basic_monthly_mean", "basic_monthly_median",
    "gross_monthly_mean", "gross_monthly_median",
    "gross_mthly_25_percentile", "gross_mthly_75_percentile",
]

# Normalize school names across years (universities reorganized faculties over time)
SCHOOL_NORMALIZE = {
    # NTU
    "College of Business / Nanyang Business School": "College of Business (Nanyang Business School)",
    "College of Sciences": "College of Science",
    "Sports Science and Management": "College of Humanities, Arts & Social Sciences",
    # NUS
    "Faculty Of Dentistry": "Faculty of Dentistry",
    "Faculty Of Engineering": "College of Design and Engineering",
    "Faculty of Engineering": "College of Design and Engineering",
    "Multi-Disciplinary Programme": "Multi-Disciplinary Programmes",
    "Multidisciplinary Programmes": "Multi-Disciplinary Programmes",
    "YLL School of Medicine": "Yong Loo Lin School of Medicine",
    "Yong Loo Lin School (Medicine)": "Yong Loo Lin School of Medicine",
    "YST Conservatory Of Music": "Yong Siew Toh Conservatory of Music",
    "YST Conservatory of Music": "Yong Siew Toh Conservatory of Music",
    "School of Design & Environment": "College of Design and Engineering",
    # SIT - normalize dash variants
    "SIT- DigiPen Institute of Technology": "SIT – DigiPen Institute of Technology",
    "SIT-DigiPen Institute of Technology": "SIT – DigiPen Institute of Technology",
    "SIT- Massey University": "SIT – Massey University",
    "SIT-Massey University": "SIT – Massey University",
    "SIT- Newcastle University": "SIT – Newcastle University",
    "SIT-Newcastle University": "SIT – Newcastle University",
    "Newcastle University": "SIT – Newcastle University",
    "SIT- Technische Universitat Munchen": "SIT – Technical University of Munich",
    "Technische UniversitÃ¤t MÃ¼nchen": "SIT – Technical University of Munich",
    "SIT-University of Glasgow": "SIT – University of Glasgow",
    "University of Glasgow": "SIT – University of Glasgow",
    "Singapore Institute of Technology (SIT)": "Singapore Institute of Technology",
    "SIT-Trinity College Dublin": "SIT – Trinity College Dublin",
    "SIT-Trinity College Dublin / Trinity College Dublin": "SIT – Trinity College Dublin",
    "SIT / SIT-Trinity College Dublin / Trinity College Dublin": "SIT – Trinity College Dublin",
    "Singapore Institute of Technology -Trinity College Dublin": "SIT – Trinity College Dublin",
    "Singapore Institute of Technology -Trinity College Dublin / Trinity College Dublin": "SIT – Trinity College Dublin",
    "Trinity College Dublin": "SIT – Trinity College Dublin",
    "Trinity College Dublin / Singapore Institute of Technology-Trinity College Dublin": "SIT – Trinity College Dublin",
    "The Culinary Institute of America": "Culinary Institute of America",
}

# Regex-based normalization for SMU and other pattern-based variants
SCHOOL_NORMALIZE_PATTERNS = [
    # SMU: strip "(4-year programme)", "(4-years programme)", trailing *
    (r"^School of Accountancy.*", "School of Accountancy"),
    (r"^School of Business \(4-year.*", "School of Business"),
    (r"^School of Business \(4-years.*", "School of Business"),
    (r"^School of Economics.*programme.*", "School of Economics"),
    (r"^School of Social Sciences.*programme.*", "School of Social Sciences"),
    (r"^School of Law \(4-year.*", "School of Law"),
    (r"^School of Information Systems.*", "School of Computing & Information Systems"),
    (r"^School of Computing & Information Systems \(4-year programme\)(?:\s*\*)?$", "School of Computing & Information Systems"),
    (r"^School of Computing & Information Systems.*Computer Science.*", "School of Computing & Information Systems – Computer Science"),
    (r"^School of Computing & Information Systems.*Information Systems.*", "School of Computing & Information Systems – Information Systems"),
    (r"^School of Computing & Information Systems.*Computing & Law.*", "School of Computing & Information Systems – Computing & Law"),
]

# Exact "X & Y" -> "X and Y" merges. Only pairs where both spellings exist
# in the raw data under the same university + school.
AMPERSAND_PAIRS = {
    "Art, Design & Media": "Art, Design and Media",
    "Biomedical Sciences & Chinese Medicine": "Biomedical Sciences and Chinese Medicine",
    "Chemical & Biomolecular Engineering": "Chemical and Biomolecular Engineering",
    "Electrical & Electronic Engineering": "Electrical and Electronic Engineering",
    "Information Engineering & Media": "Information Engineering and Media",
    "Linguistics & Multilingual Studies": "Linguistics and Multilingual Studies",
    "Mathematics & Economics": "Mathematics and Economics",
    "Bachelor of Engineering with Honours in Mechanical Design & Manufacturing Engineering": "Bachelor of Engineering with Honours in Mechanical Design and Manufacturing Engineering",
    "Bachelor of Science in Computer Science & Game Design": "Bachelor of Science in Computer Science and Game Design",
    "Bachelor of Science with Honours in Food & Human Nutrition": "Bachelor of Science with Honours in Food and Human Nutrition",
}


def normalize_school(name, university=""):
    """Normalize school name to canonical form."""
    name = name.strip()
    # SUTD doesn't have schools/faculties
    if "Technology and Design" in university:
        return "N.A."
    # Exact match first
    if name in SCHOOL_NORMALIZE:
        return SCHOOL_NORMALIZE[name]
    # Regex patterns
    for pattern, replacement in SCHOOL_NORMALIZE_PATTERNS:
        if re.match(pattern, name):
            return replacement
    # Catch-all: "na" -> "N.A."
    if name.lower() == "na":
        return "N.A."
    return name


def normalize_degree(name):
    """Clean degree name by removing footnote markers and normalizing capitalization."""
    name = name.strip()
    # Remove trailing combinations of #, *, ^, whitespace
    name = re.sub(r'[\s#*^]+$', '', name)
    # Remove trailing footnote numbers like "7" at end
    name = re.sub(r'\s*\d+$', '', name)
    # Normalize mid-word capitalization: "And" -> "and", "Of" -> "of", "With" -> "with"
    # But only when they're standalone words (not at start of string)
    name = re.sub(r'(?<=\s)And(?=\s)', 'and', name)
    name = re.sub(r'(?<=\s)Of(?=\s)', 'of', name)
    name = re.sub(r'(?<=[\s(])With(?=\s)', 'with', name)
    name = name.replace(' Majoring ', ' majoring ')
    # Normalize "ElectroMechanical" -> "Electromechanical"
    name = name.replace('ElectroMechanical', 'Electromechanical')
    # Collapse any accidental double spaces from the raw source
    name = re.sub(r'\s{2,}', ' ', name)
    # NTU 2017 reported degrees in long form. Strip the "Bachelor of X (Hons)"
    # wrapper so they merge with the short-form degrees used in other years.
    #   "Bachelor of Engineering (Hons) (Aerospace Engineering)" -> "Aerospace Engineering"
    #   "Bachelor of Arts (Hons) in Economics" -> "Economics"
    m = re.match(r'^Bachelor of (?:Engineering|Science|Arts) \(Hons\) \((.+)\)$', name)
    if m:
        name = m.group(1)
    m = re.match(r'^Bachelor of (?:Science|Arts) \(Hons\) in (.+)$', name)
    if m:
        name = m.group(1)
    # NTU 2017 one-off long-form names that don't match the (Hons) (X) pattern
    if name == 'Bachelor of Communication Studies (Hons)':
        name = 'Communication Studies'
    if name == 'Bachelor of Fine Arts (Hons)':
        name = 'Art, Design and Media'
    # Normalize "Art, Design & Media" -> "Art, Design and Media"
    name = name.replace('Art, Design & Media', 'Art, Design and Media')
    # Normalize Sport/Sports Science variants
    if 'Sport' in name and 'Management' in name:
        name = 'Sports Science and Management'
    # Normalize Interdisciplinary Double Major variants
    if 'nter' in name and 'isciplin' in name and ('Double' in name or 'Integrated' in name):
        name = 'Interdisciplinary Double Major'
    # Exact "&" -> "and" merges where both variants exist in the same
    # university + school (discovered by comparing raw CSV degree names).
    # Keeps proper-name programs like "Computing & Law" untouched.
    if name in AMPERSAND_PAIRS:
        name = AMPERSAND_PAIRS[name]
    # Normalize Linguistics and Multilingual Studies variants
    if 'Linguistics' in name and 'Multilingual Studies' in name:
        name = 'Linguistics and Multilingual Studies'
    # Normalize Biomedical Science (singular) to Biomedical Sciences
    if name == 'Biomedical Science':
        name = 'Biomedical Sciences'
    # Normalize Chemistry & Biological Chemistry variants
    if 'Chemistry' in name and 'Biological Chemistry' in name:
        name = 'Chemistry and Biological Chemistry'
    # Normalize Physics and Applied Physics variants
    if 'Physics' in name and 'Applied Physics' in name:
        name = 'Physics and Applied Physics'
    # NTU NIE: normalize Arts/Science Education variants
    if name in ('Arts (and Education)', 'Arts (Academic Discipline and Education)',
                'Bachelor of Arts (Hons) (Education)'):
        name = 'Arts (with Education)'
    if name in ('Science (and Education)', 'Science (Academic Discipline and Education)',
                'Bachelor of Science (Hons) (Education)'):
        name = 'Science (with Education)'
    # SIT: normalize Digital Arts & Animation
    name = name.replace('Digital Arts & Animation', 'Digital Art and Animation')
    # SMU: strip "(4-year programme)" / "(4-years programme)" suffix from degree names
    name = re.sub(r'\s*\(4-years? programme\)\s*', '', name).strip()
    # SMU: normalize all "X Cum Laude and above" / "X (Cum Laude and above)" / "X - Cum Laude and above" to "Cum Laude and above"
    if 'Cum Laude' in name and name != 'Cum Laude and above':
        name = 'Cum Laude and above'
    # Normalize Mathematical Science(s) variants — only exact matches, not compound degrees
    if name in ('Mathematical Science', 'Mathematical Sciences',
                'Bachelor of Science (Hons) in Mathematical Sciences',
                'Mathematical Sciences / Mathematical Sciences and Economics',
                'Mathematics and Mathematical Sciences'):
        name = 'Mathematical Sciences'
    return name.strip()


def parse_csv():
    """Parse existing CSV into list of dicts."""
    rows = []
    with open(CSV_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            record = {}
            for col in CSV_COLUMNS:
                val = row[col].strip()
                if col == "year":
                    record[col] = int(val)
                elif col == "school":
                    record[col] = normalize_school(val, row.get("university", ""))
                elif col == "degree":
                    record[col] = normalize_degree(val)
                elif col == "university":
                    record[col] = val
                else:
                    record[col] = parse_number(val)
            rows.append(record)
    return rows


def parse_number(val):
    """Parse a numeric string, return None for N.A. or empty."""
    if not val or val.strip() in ("na", "n.a.", "N.A.", "-", ""):
        return None
    val = val.strip().replace("$", "").replace(",", "").replace("%", "")
    try:
        return float(val)
    except ValueError:
        return None


def clean_text(text):
    """Clean cell text from PDF extraction."""
    if text is None:
        return ""
    return text.replace("\n", " ").strip()


def extract_pdf_data(university, pdf_path):
    """Extract 2025 GES data from a PDF."""
    rows = []
    pdf = pdfplumber.open(pdf_path)

    # Carry school context across pages
    current_school = None

    for page in pdf.pages:
        tables = page.extract_tables()
        if not tables:
            continue

        # The main data table is always the first/largest table
        table = tables[0]

        for row in table:
            # Clean all cells
            cells = [clean_text(c) for c in row]

            # Skip header rows
            if any(h in " ".join(cells) for h in [
                "Degree", "Response", "Proportion", "had/were",
                "Secured", "Currently", "Permanent", "Employment",
                "Basic Monthly", "Gross Monthly", "Salary", "Percentile",
                "Mean", "Median",
            ]):
                continue

            # Skip empty rows
            if all(c == "" for c in cells):
                continue

            # Detect school header rows — they have text in cell[1] (or cell[0])
            # and no numeric data
            non_empty = [c for c in cells if c]
            if len(non_empty) == 1 and not any(c.startswith("$") or c.endswith("%") for c in non_empty):
                school_text = non_empty[0]
                # Skip footnote markers
                if school_text.startswith("Source:") or school_text.startswith("Note"):
                    continue
                if len(school_text) > 10:  # Likely a school name
                    current_school = school_text
                    # Clean up school names - remove footnote numbers and normalize
                    current_school = re.sub(r'\d+$', '', current_school).strip()
                    current_school = re.sub(r'\s*\(CoB\)', '', current_school)
                    current_school = re.sub(r'\s*\(CoE\)', '', current_school)
                    current_school = re.sub(r'\s*\(CoS\)', '', current_school)
                    current_school = re.sub(r'\s*\(CoHASS\)', '', current_school)
                    current_school = re.sub(r'\s*\(CCDS\)', '', current_school)
                continue

            # Check if this is a data row (has degree name and numeric values)
            degree = cells[0] if cells[0] else ""
            if not degree:
                # Sometimes degree is in cell[1]
                degree = cells[1] if len(cells) > 1 and cells[1] else ""
            if not degree:
                continue

            # Skip "Source:" lines and footnotes
            if degree.startswith("Source:") or degree.startswith("Note") or degree.startswith("**"):
                continue

            # Clean degree name - remove footnote markers
            degree = re.sub(r'\*+$', '', degree).strip()
            degree = re.sub(r'\d+$', '', degree).strip()

            # Extract numeric values from the row
            nums = []
            for c in cells:
                if c and (c.endswith("%") or c.startswith("$") or c == "N.A."):
                    nums.append(c)

            # We expect: response_rate, secured_employment, currently_employed,
            # ft_perm, basic_mean, basic_median, gross_mean, gross_median, gross_25, gross_75
            # = 10 numeric values (but we skip response_rate and currently_employed)

            if len(nums) < 7:
                continue  # Not enough data

            # Parse based on the number of values found
            # Pattern: response_rate%, secured%, currently%, ft_perm%, $basic_mean, $basic_median, $gross_mean, $gross_median, $gross_25, $gross_75
            if len(nums) >= 10:
                employment_rate_overall = parse_number(nums[1])  # Secured Employment
                employment_rate_ft_perm = parse_number(nums[3])  # FT Permanent
                basic_mean = parse_number(nums[4])
                basic_median = parse_number(nums[5])
                gross_mean = parse_number(nums[6])
                gross_median = parse_number(nums[7])
                gross_25 = parse_number(nums[8])
                gross_75 = parse_number(nums[9])
            elif len(nums) >= 7:
                # Fewer columns extracted — try best mapping
                # Look for dollar signs to separate employment rates from salaries
                dollar_start = next((i for i, n in enumerate(nums) if n.startswith("$")), None)
                if dollar_start is not None and dollar_start >= 2 and len(nums) - dollar_start >= 6:
                    employment_rate_overall = parse_number(nums[0])
                    employment_rate_ft_perm = parse_number(nums[dollar_start - 1])
                    basic_mean = parse_number(nums[dollar_start])
                    basic_median = parse_number(nums[dollar_start + 1])
                    gross_mean = parse_number(nums[dollar_start + 2])
                    gross_median = parse_number(nums[dollar_start + 3])
                    gross_25 = parse_number(nums[dollar_start + 4])
                    gross_75 = parse_number(nums[dollar_start + 5])
                else:
                    continue
            else:
                continue

            # Use "N.A." school for universities without school structure (SUTD)
            school = normalize_school(current_school or "N.A.", university)

            record = {
                "year": 2025,
                "university": university,
                "school": school,
                "degree": normalize_degree(degree),
                "employment_rate_overall": employment_rate_overall,
                "employment_rate_ft_perm": employment_rate_ft_perm,
                "basic_monthly_mean": basic_mean,
                "basic_monthly_median": basic_median,
                "gross_monthly_mean": gross_mean,
                "gross_monthly_median": gross_median,
                "gross_mthly_25_percentile": gross_25,
                "gross_mthly_75_percentile": gross_75,
            }
            rows.append(record)

    pdf.close()
    return rows


def main():
    print("Parsing CSV...")
    csv_rows = parse_csv()
    print(f"  CSV: {len(csv_rows)} rows (years {min(r['year'] for r in csv_rows)}-{max(r['year'] for r in csv_rows)})")

    all_pdf_rows = []
    for university, pdf_path in PDF_FILES.items():
        print(f"Extracting from {pdf_path.name}...")
        rows = extract_pdf_data(university, pdf_path)
        print(f"  {university}: {len(rows)} rows")
        for r in rows:
            print(f"    - {r['school']} / {r['degree']}: gross_median={r['gross_monthly_median']}")
        all_pdf_rows.extend(rows)

    print(f"\nTotal PDF rows: {len(all_pdf_rows)}")

    # Merge
    all_data = csv_rows + all_pdf_rows

    # Reclassify NTU degrees that moved from College of Engineering to CCDS in 2024
    CCDS_DEGREES = {
        "Computer Engineering",
        "Computer Science",
        "Data Science and Artificial Intelligence",
    }
    reclassified = 0
    for row in all_data:
        if (row["university"] == "Nanyang Technological University"
                and row["degree"] in CCDS_DEGREES
                and row["school"] == "College of Engineering"):
            row["school"] = "College of Computing and Data Science"
            reclassified += 1
    print(f"Reclassified {reclassified} NTU rows from College of Engineering to CCDS")

    # Fix NTU 2017 source data: many CoHASS degrees were mistakenly listed
    # under "College of Engineering" in the raw CSV. Move them to CoHASS
    # (where they appear in every other year).
    COHASS_DEGREES = {
        "Art, Design and Media",
        "Chinese",
        "Communication Studies",
        "Economics",
        "English",
        "History",
        "Linguistics and Multilingual Studies",
        "Philosophy",
        "Psychology",
        "Public Policy and Global Affairs",
        "Sociology",
    }
    cohass_fixes = 0
    for row in all_data:
        if (row["university"] == "Nanyang Technological University"
                and row["year"] == 2017
                and row["degree"] in COHASS_DEGREES
                and row["school"] == "College of Engineering"):
            row["school"] = "College of Humanities, Arts & Social Sciences"
            cohass_fixes += 1
    print(f"Fixed {cohass_fixes} NTU 2017 rows misplaced under College of Engineering")

    print(f"Total combined: {len(all_data)} rows")

    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=None)

    print(f"Written to {OUTPUT_PATH}")
    print(f"File size: {OUTPUT_PATH.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()
