import { getUniversities, getSchools, getDegrees, UNI_SHORT } from '../lib/data';

function SingleSelect({ label, options, selected, onChange, renderOption }) {
  const toggle = (value) => {
    // Single select: clicking the same value deselects, otherwise replace
    if (selected === value) {
      onChange(null);
    } else {
      onChange(value);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                ${isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900'
                }
              `}
            >
              {renderOption ? renderOption(opt) : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterPanel({ state, onUpdate }) {
  const university = state.universities[0] || null;
  const school = state.schools[0] || null;
  const degree = state.degrees[0] || null;

  const universities = getUniversities();
  const schools = university ? getSchools([university]) : [];
  const degrees = school ? getDegrees([university], [school]) : [];

  return (
    <div className="space-y-4">
      <SingleSelect
        label="University"
        options={universities}
        selected={university}
        onChange={(v) => onUpdate({ universities: v ? [v] : [], schools: [], degrees: [] })}
        renderOption={(uni) => UNI_SHORT[uni] || uni}
      />

      {university && schools.length > 0 && (
        <SingleSelect
          label="School / Faculty"
          options={schools}
          selected={school}
          onChange={(v) => onUpdate({ schools: v ? [v] : [], degrees: [] })}
        />
      )}

      {school && degrees.length > 0 && (
        <SingleSelect
          label="Degree"
          options={degrees}
          selected={degree}
          onChange={(v) => onUpdate({ degrees: v ? [v] : [] })}
        />
      )}
    </div>
  );
}
