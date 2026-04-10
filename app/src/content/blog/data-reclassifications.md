---
title: "Data Reclassifications"
description: "How we normalize degree and school names across years so you see continuous time series, and a running log of every reclassification we've made."
pubDate: 2025-04-09
updatedDate: 2025-04-09
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

## Degree name normalizations

These are cosmetic normalizations — same degree, different spellings over the years.

### NTU

- **Art, Design & Media** -> **Art, Design and Media**
- **Sport Science and Management** / **Bachelor of Science (Hons) (Sport Science & Management)** -> **Sports Science and Management**
- **Inter-Disciplinary Double Major** / **Interdisciplinary Double / Integrated Major** -> **Interdisciplinary Double Major**
- **Physics / Applied Physics** / **Physics & Applied Physics** / **Bachelor of Science (Hons) in Physics/Applied Physics** -> **Physics and Applied Physics**
- **Mathematical Science** -> **Mathematical Sciences**

### NTU — National Institute of Education

- **Arts (and Education)** / **Arts (Academic Discipline and Education)** / **Bachelor of Arts (Hons) (Education)** -> **Arts (with Education)**
- **Science (and Education)** / **Science (Academic Discipline and Education)** / **Bachelor of Science (Hons) (Education)** -> **Science (with Education)**

### NUS — minor variants

- Mid-word capitalization normalized: "And" -> "and", "Of" -> "of", "With" -> "with"
- "ElectroMechanical" -> "Electromechanical"

### SIT

- **Bachelor of Fine Arts in Digital Arts & Animation** -> **Bachelor of Fine Arts in Digital Art and Animation**
- Various dash and spacing variants normalized (e.g. "SIT- DigiPen" -> "SIT – DigiPen")

### SMU

- "(4-year programme)" and "(4-years programme)" suffixes stripped
- All "X Cum Laude and above" / "X (Cum Laude and above)" / "X - Cum Laude and above" variants merged into a single **Cum Laude and above** row per school
- Example: **Information Systems - Cum Laude and above**, **Information Systems Cum Laude and above**, **Information Systems (Cum Laude and above)** all become **Cum Laude and above**

### SUTD

- School/faculty field set to **N.A.** across all years (SUTD doesn't organize degrees by school)

### General cleanup

- Trailing footnote markers (`#`, `*`, `**`, `^`) stripped from all degree names
- Trailing footnote numbers stripped
- Encoding artifacts fixed (e.g. `ï¿½` characters in some SMU rows)

## What we don't reclassify

We don't change the underlying numbers. If a university reports a single combined row like "Mathematical Sciences / Mathematical Sciences and Economics", we keep that exactly as a single degree rather than splitting it, because the salary is reported for the combined cohort.

We also don't invent missing data. If a degree has gaps in certain years, the chart shows those gaps.

## Source data

The CSV covering 2013-2024 comes from data.gov.sg. The 2025 data is extracted from the PDF reports published by each university via MOE's Joint Autonomous University GES. All data is normalized by the script at `scripts/prepare_data.py` in our repository.
