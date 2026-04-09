import { getUniversities, getSchools, getDegreeSplit, UNI_SHORT } from '../lib/data';

function SingleSelect({ label, options, selected, onChange, renderOption }) {
  const toggle = (value) => {
    if (selected === value) {
      onChange(null);
    } else {
      onChange(value);
    }
  };

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-2">
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
                px-3 py-1.5 text-xs transition-all duration-100 border
                ${isActive
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-transparent text-muted border-rule hover:border-ink hover:text-ink'
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

function DegreePicker({ university, school, selected, onChange }) {
  const { current, historical } = getDegreeSplit(
    university ? [university] : [],
    school ? [school] : []
  );

  const toggle = (value) => {
    onChange(selected === value ? null : value);
  };

  const renderButtons = (options) =>
    options.map((opt) => {
      const isActive = selected === opt;
      return (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`
            px-3 py-1.5 text-xs transition-all duration-100 border
            ${isActive
              ? 'bg-ink text-cream border-ink'
              : 'bg-transparent text-muted border-rule hover:border-ink hover:text-ink'
            }
          `}
        >
          {opt}
        </button>
      );
    });

  return (
    <div className="space-y-4">
      {current.length > 0 && (
        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-2">
            Current Degrees
          </label>
          <div className="flex flex-wrap gap-1.5">
            {renderButtons(current)}
          </div>
        </div>
      )}
      {historical.length > 0 && (
        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-2">
            Historical Degrees
          </label>
          <div className="flex flex-wrap gap-1.5">
            {renderButtons(historical)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterPanel({ state, onUpdate }) {
  const university = state.universities[0] || null;
  const school = state.schools[0] || null;
  const degree = state.degrees[0] || null;

  const universities = getUniversities();
  const schools = university ? getSchools([university]) : [];

  return (
    <div className="space-y-5">
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

      {school && (
        <DegreePicker
          university={university}
          school={school}
          selected={degree}
          onChange={(v) => onUpdate({ degrees: v ? [v] : [] })}
        />
      )}
    </div>
  );
}
