import rawData from '../data/data.json';

// Short university labels for UI
export const UNI_SHORT = {
  'Nanyang Technological University': 'NTU',
  'National University of Singapore': 'NUS',
  'Singapore Institute of Technology': 'SIT',
  'Singapore Management University': 'SMU',
  'Singapore University of Social Sciences': 'SUSS',
  'Singapore University of Technology and Design': 'SUTD',
};

export const UNI_COLORS = {
  'Nanyang Technological University': '#C41E3A',
  'National University of Singapore': '#EF7C00',
  'Singapore Institute of Technology': '#003D73',
  'Singapore Management University': '#002664',
  'Singapore University of Social Sciences': '#5B2C8E',
  'Singapore University of Technology and Design': '#A6192E',
};

// Generate distinct colors for degree lines
const DEGREE_PALETTE = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
  '#0891b2', '#d946ef', '#65a30d', '#e11d48', '#0d9488',
  '#7c3aed', '#ca8a04', '#4f46e5', '#059669', '#db2777',
  '#2dd4bf', '#f97316', '#6366f1', '#84cc16', '#f43f5e',
];

export function getDegreeColor(index) {
  return DEGREE_PALETTE[index % DEGREE_PALETTE.length];
}

export const METRICS = {
  employment_rate_overall: { label: 'Overall Employment Rate', unit: '%', format: (v) => `${v.toFixed(1)}%` },
  employment_rate_ft_perm: { label: 'Full-Time Permanent Employment Rate', unit: '%', format: (v) => `${v.toFixed(1)}%` },
  basic_monthly_mean: { label: 'Basic Monthly Salary (Mean)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
  basic_monthly_median: { label: 'Basic Monthly Salary (Median)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
  gross_monthly_mean: { label: 'Gross Monthly Salary (Mean)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
  gross_monthly_median: { label: 'Gross Monthly Salary (Median)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
  gross_mthly_25_percentile: { label: 'Gross Monthly Salary (25th Percentile)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
  gross_mthly_75_percentile: { label: 'Gross Monthly Salary (75th Percentile)', unit: '$', format: (v) => `$${v.toLocaleString()}` },
};

export const data = rawData;

// Degrees that were reclassified between schools
export const RECLASSIFICATIONS = [
  {
    university: 'Nanyang Technological University',
    school: 'College of Computing and Data Science',
    degrees: ['Computer Engineering', 'Computer Science', 'Data Science and Artificial Intelligence'],
    fromSchool: 'College of Engineering',
    year: 2024,
    note: 'Prior to 2024, this degree was offered under College of Engineering.',
  },
];

export function getReclassificationNote(university, school, degree) {
  for (const r of RECLASSIFICATIONS) {
    if (r.university === university && r.school === school && r.degrees.includes(degree)) {
      return r.note;
    }
  }
  return null;
}

export function getUniversities() {
  return [...new Set(data.map((r) => r.university))].sort();
}

export function getSchools(universities) {
  const filtered = universities.length
    ? data.filter((r) => universities.includes(r.university))
    : data;
  return [...new Set(filtered.map((r) => r.school))].sort();
}

export function getDegrees(universities, schools) {
  let filtered = data;
  if (universities.length) filtered = filtered.filter((r) => universities.includes(r.university));
  if (schools.length) filtered = filtered.filter((r) => schools.includes(r.school));
  return [...new Set(filtered.map((r) => r.degree))].sort();
}

// Build a set of degrees that have 2025 data (within a given university + school context)
export function getDegreeSplit(universities, schools) {
  let filtered = data;
  if (universities.length) filtered = filtered.filter((r) => universities.includes(r.university));
  if (schools.length) filtered = filtered.filter((r) => schools.includes(r.school));

  const has2025 = new Set(
    filtered.filter((r) => r.year === 2025).map((r) => r.degree)
  );
  const allDegrees = [...new Set(filtered.map((r) => r.degree))].sort();

  return {
    current: allDegrees.filter((d) => has2025.has(d)),
    historical: allDegrees.filter((d) => !has2025.has(d)),
  };
}

export function getFilteredData(universities, schools, degrees) {
  let filtered = data;
  if (universities.length) filtered = filtered.filter((r) => universities.includes(r.university));
  if (schools.length) filtered = filtered.filter((r) => schools.includes(r.school));
  if (degrees.length) filtered = filtered.filter((r) => degrees.includes(r.degree));
  return filtered;
}

export function getChartData(filteredData, metric) {
  // Group by degree (or university+degree for cross-university comparison)
  const series = {};
  for (const row of filteredData) {
    const key = `${UNI_SHORT[row.university] || row.university} - ${row.degree}`;
    if (!series[key]) series[key] = { name: key, university: row.university, data: {} };
    if (row[metric] != null) {
      series[key].data[row.year] = row[metric];
    }
  }

  // Get all years
  const years = [...new Set(filteredData.map((r) => r.year))].sort();

  // Build chart-friendly format: [{ year, "NTU - CS": 5500, "NUS - CS": 6000, ... }]
  const chartData = years.map((year) => {
    const point = { year };
    for (const [key, s] of Object.entries(series)) {
      point[key] = s.data[year] ?? null;
    }
    return point;
  });

  return { chartData, seriesKeys: Object.keys(series), series };
}
