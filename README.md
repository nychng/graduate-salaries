# Singapore Graduate Employment Survey Explorer

Interactive webapp to explore salary and employment data from the MOE Singapore Graduate Employment Survey (2013-2025). Covers NTU, NUS, SIT, SMU, SUSS and SUTD.

## Features

- Filter by university, school/faculty, and degree
- View trends over time (2013-2025) as line charts
- Toggle between metrics: employment rates, gross salary (mean, median, 25th/75th percentile)
- Shareable URLs — filter state is encoded in the URL hash
- Sortable data table below the chart
- Responsive design

## Tech Stack

- **React 19 + Vite** — client-side SPA with static build output
- **Tailwind CSS v4** — utility-first styling
- **Recharts** — line charts with tooltips
- **Python** — data preparation (CSV + PDF parsing)

## Setup

### Prerequisites

- Node.js 18+
- Python 3.9+ with `pdfplumber` (`pip install pdfplumber`)

### Data Preparation

Place the source data files in the project root:
- `GraduateEmploymentSurveyNTUNUSSITSMUSUSSSUTD.csv` (from data.gov.sg)
- `Web Publication [NTU|NUS|SIT|SMU|SUSS|SUTD] GES 2025.pdf` (from MOE)

Then run:

```bash
python3 scripts/prepare_data.py
```

This parses the CSV (2013-2024) and extracts 2025 data from the PDFs, normalizes school/degree names, and outputs `app/src/data/data.json`.

### Development

```bash
cd app
npm install
npm run dev
```

### Production Build

```bash
cd app
npm run build
```

The `dist/` folder contains static HTML/CSS/JS files ready for deployment to any web server.

## Deployment

Upload the contents of `app/dist/` to your web host (e.g. SiteGround via file manager or FTP). No server-side runtime required.

## Data Source

Graduate Employment Survey jointly conducted by NTU, NUS, SMU, SUTD, SIT and SUSS, published by the Ministry of Education, Singapore.
