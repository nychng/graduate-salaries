---
title: "Data Reclassifications"
description: "How we normalize degree and school names across years so you see continuous time series, and a running log of every reclassification we've made."
pubDate: 2025-04-09
updatedDate: 2025-04-10
author: "GES Explorer"
---

Universities in Singapore restructure their schools, rename degrees, and change reporting conventions over time. The raw Graduate Employment Survey data reflects these changes literally — which means a single degree might appear under three different school names across twelve years, breaking the time series.

On this site, we normalize these variants so you can see continuous trends from 2013 to 2025. This page lists every reclassification we've made. We'll update it as we find more.

If you spot anything that looks wrong or missing, [let us know](/).

## School reclassifications

### NTU — Computer Engineering, Computer Science, Data Science & AI

From 2024, NTU moved these three degrees from College of Engineering (CoE) to the new College of Computing and Data Science (CCDS). We show them under CCDS for all years so you get the full history.

### NUS — College of Design and Engineering

In 2022, NUS merged the Faculty of Engineering with the School of Design & Environment to form the College of Design and Engineering (CDE). All engineering and design degrees are shown under CDE for every year.

### NTU — Sports Science and Management

The Bachelor of Sports Science and Management moved around over the years: it started under College of Science (2013-2015), then College of Humanities, Arts & Social Sciences, and is currently under the National Institute of Education. Each row reflects the school it was reported under that year.

### NTU 2017 — humanities degrees mislabelled under College of Engineering

The raw 2017 NTU data has a source-side error: many College of Humanities, Arts & Social Sciences (CoHASS) degrees were mistakenly reported under "College of Engineering". We move them back to CoHASS so 2017 lines up with every other year. The affected degrees are Chinese, Economics, English, History, Linguistics and Multilingual Studies, Philosophy, Psychology, Public Policy and Global Affairs, Sociology, Art, Design and Media, and Communication Studies.

## Degree name normalizations

These are cosmetic normalizations — same degree, different spellings or formats over the years.

### NTU — long-form (Hons) wrapper stripping

In 2017, NTU reported every degree in its long form with a "Bachelor of X (Hons) ..." wrapper, while every other year used the short form. We strip the wrapper so the time series stays continuous. Examples:

- **Bachelor of Engineering (Hons) (Aerospace Engineering)** -> **Aerospace Engineering**
- **Bachelor of Engineering (Hons) (Computer Science)** -> **Computer Science**
- **Bachelor of Science (Hons) in Biological Sciences** -> **Biological Sciences**
- **Bachelor of Arts (Hons) in History** -> **History**
- **Bachelor of Communication Studies (Hons)** -> **Communication Studies**
- **Bachelor of Fine Arts (Hons)** -> **Art, Design and Media**

### NTU — ampersand vs "and" pairs

Where both an "&" version and an "and" version of the same degree exist under the same school (usually because NTU switched conventions around 2019-2020), we merge them.

- **Art, Design & Media** -> **Art, Design and Media**
- **Chemical & Biomolecular Engineering** -> **Chemical and Biomolecular Engineering**
- **Electrical & Electronic Engineering** -> **Electrical and Electronic Engineering**
- **Information Engineering & Media** -> **Information Engineering and Media**
- **Linguistics & Multilingual Studies** -> **Linguistics and Multilingual Studies**
- **Mathematics & Economics** -> **Mathematics and Economics**
- **Biomedical Sciences & Chinese Medicine** -> **Biomedical Sciences and Chinese Medicine**

Proper-name programmes that officially use "&" (for example "Computing & Law" at SMU, or SIT's "Information & Communications Technology") are left alone because there is no "and" counterpart in the data.

### NTU — other degree-specific merges

- **Sport Science and Management** / **Bachelor of Science (Hons) (Sport Science & Management)** -> **Sports Science and Management**
- **Inter-Disciplinary Double Major** / **Interdisciplinary Double / Integrated Major** -> **Interdisciplinary Double Major**
- **Physics / Applied Physics** / **Physics & Applied Physics** / **Bachelor of Science (Hons) in Physics/Applied Physics** -> **Physics and Applied Physics**
- **Mathematical Science** -> **Mathematical Sciences**
- **Chemistry & Biological Chemistry** / **Bachelor of Science (Hons) in Chemistry & Biological Chemistry** -> **Chemistry and Biological Chemistry**
- **Biomedical Science** (singular) -> **Biomedical Sciences**
- **Linguistics & Multilingual Studies** / **Bachelor of Arts (Hons) in Linguistics and Multilingual Studies** -> **Linguistics and Multilingual Studies**

### NTU — National Institute of Education

- **Arts (and Education)** / **Arts (Academic Discipline and Education)** / **Bachelor of Arts (Hons) (Education)** -> **Arts (with Education)**
- **Science (and Education)** / **Science (Academic Discipline and Education)** / **Bachelor of Science (Hons) (Education)** -> **Science (with Education)**

### NUS — minor variants

- Mid-word capitalization normalized: "And" -> "and", "Of" -> "of", "With" -> "with"
- "ElectroMechanical" -> "Electromechanical"

### SIT

- **Bachelor of Fine Arts in Digital Arts & Animation** -> **Bachelor of Fine Arts in Digital Art and Animation**
- **Bachelor of Engineering with Honours in Mechanical Design & Manufacturing Engineering** -> **Bachelor of Engineering with Honours in Mechanical Design and Manufacturing Engineering**
- **Bachelor of Science in Computer Science & Game Design** -> **Bachelor of Science in Computer Science and Game Design**
- **Bachelor of Science with Honours in Food & Human Nutrition** -> **Bachelor of Science with Honours in Food and Human Nutrition**
- Various dash and spacing variants normalized (e.g. "SIT- DigiPen" -> "SIT – DigiPen", "SIT-Newcastle" -> "SIT – Newcastle")

### SMU

- "(4-year programme)" and "(4-years programme)" suffixes stripped
- All "X Cum Laude and above" / "X (Cum Laude and above)" / "X - Cum Laude and above" variants merged into a single **Cum Laude and above** row per school
- Example: **Information Systems - Cum Laude and above**, **Information Systems Cum Laude and above**, **Information Systems (Cum Laude and above)** all become **Cum Laude and above**

### SUTD

- School/faculty field set to **N.A.** across all years (SUTD doesn't organize degrees by school)

### General cleanup

- Trailing footnote markers (`#`, `*`, `**`, `^`) stripped from all degree names
- Trailing footnote numbers stripped
- Double spaces collapsed to single spaces (a few raw rows had accidental double spacing)
- Encoding artifacts fixed (e.g. `ï¿½` characters in some SMU rows)

## What we don't reclassify

We don't change the underlying numbers. If a university reports a single combined row like "Mathematical Sciences / Mathematical Sciences and Economics", we keep that exactly as a single degree rather than splitting it, because the salary is reported for the combined cohort.

We also don't invent missing data. If a degree has gaps in certain years, the chart shows those gaps.

## Source data

The CSV covering 2013-2024 comes from data.gov.sg. The 2025 data is extracted from the PDF reports published by each university via MOE's Joint Autonomous University GES. All data is normalized by the script at `scripts/prepare_data.py` in our repository.
