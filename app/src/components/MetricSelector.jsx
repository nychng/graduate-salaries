import { useState } from 'react';

const SHORT_LABELS = {
  employment_rate_overall: 'Overall',
  employment_rate_ft_perm: 'FT Permanent',
  basic_monthly_mean: 'Mean',
  basic_monthly_median: 'Median',
  gross_monthly_mean: 'Mean',
  gross_monthly_median: 'Median',
  gross_mthly_25_percentile: '25th Percentile',
  gross_mthly_75_percentile: '75th Percentile',
};

export const FOOTNOTES = [
  { label: 'Employment Rate', text: 'Full-time permanent employment refers to employment of at least 35 hours a week and where the employment is not temporary. It includes those on contracts of one year or more.' },
  { label: 'Gross Salary', text: 'Gross monthly salary pertains only to full-time permanently employed graduates. It comprises basic salary, overtime payments, commissions, fixed allowances and other regular cash payments, before deductions of the employee\u2019s CPF contributions and personal income tax. Employer\u2019s CPF contributions, bonuses, stock options, lump sum payments, and payments-in-kind are excluded.' },
];

const FOOTNOTES_MAP = Object.fromEntries(FOOTNOTES.map(f => [f.label, f.text]));

function FootnoteLabel({ group, index }) {
  const [open, setOpen] = useState(false);
  const note = FOOTNOTES_MAP[group];
  if (!note) return <span className="text-xs text-gray-400 mr-1">{group}:</span>;

  return (
    <span className="text-xs text-gray-400 mr-1 relative">
      {group}
      <sup
        className="text-blue-500 cursor-help ml-0.5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
      >
        {index}
      </sup>
      :
      {open && (
        <span className="absolute left-0 top-5 z-10 w-72 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-[11px] leading-relaxed text-gray-600 font-normal normal-case tracking-normal">
          {note}
        </span>
      )}
    </span>
  );
}

export default function MetricSelector({ selected, onChange }) {
  const groups = {
    'Employment Rate': ['employment_rate_overall', 'employment_rate_ft_perm'],
    'Gross Salary': ['gross_monthly_mean', 'gross_monthly_median', 'gross_mthly_25_percentile', 'gross_mthly_75_percentile'],
  };

  const groupKeys = Object.keys(groups);

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Metric
      </label>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {groupKeys.map((group, gi) => (
          <div key={group} className="flex flex-wrap items-center gap-1.5">
            <FootnoteLabel group={group} index={gi + 1} />
            {groups[group].map((key) => (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`
                  px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150
                  ${selected === key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-700'
                  }
                `}
              >
                {SHORT_LABELS[key]}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
