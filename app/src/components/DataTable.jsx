import { useState } from 'react';
import { UNI_SHORT, METRICS } from '../lib/data';

export default function DataTable({ data, metric }) {
  const [sortCol, setSortCol] = useState('year');
  const [sortDir, setSortDir] = useState('desc');

  if (!data.length) return null;

  const columns = [
    { key: 'year', label: 'Year', width: 'w-16' },
    { key: 'university', label: 'University', width: 'w-20', render: (v) => UNI_SHORT[v] || v },
    { key: 'school', label: 'School', width: '' },
    { key: 'degree', label: 'Degree', width: '' },
    { key: metric, label: METRICS[metric]?.label || metric, width: 'w-28' },
  ];

  const fmt = METRICS[metric]?.format || ((v) => v);

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortCol];
    const bVal = b[sortCol];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 ${col.width}`}
              >
                {col.label}
                {sortCol === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 100).map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 text-gray-900 font-medium">{row.year}</td>
              <td className="px-3 py-2 text-gray-600">{UNI_SHORT[row.university] || row.university}</td>
              <td className="px-3 py-2 text-gray-600">{row.school}</td>
              <td className="px-3 py-2 text-gray-600">{row.degree}</td>
              <td className="px-3 py-2 text-gray-900 font-medium">
                {row[metric] != null ? fmt(row[metric]) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length > 100 && (
        <p className="text-xs text-gray-400 mt-2 px-3">
          Showing 100 of {sorted.length} rows
        </p>
      )}
    </div>
  );
}
