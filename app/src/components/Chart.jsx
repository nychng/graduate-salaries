import {
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { METRICS, getDegreeColor } from '../lib/data';

// Editorial-inspired color palette — rich, muted, high contrast on cream
const EDITORIAL_COLORS = [
  '#B8432F', // deep red (accent)
  '#1A5276', // navy
  '#1E8449', // forest green
  '#7D3C98', // plum
  '#D4AC0D', // dark gold
  '#2E4053', // charcoal blue
  '#C0392B', // crimson
  '#148F77', // teal
  '#AF601A', // burnt orange
  '#5B2C6F', // deep purple
];

function getEditorialColor(index) {
  return EDITORIAL_COLORS[index % EDITORIAL_COLORS.length];
}

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const fmt = METRICS[metric]?.format || ((v) => v);

  return (
    <div className="bg-ink text-cream px-4 py-3 max-w-xs shadow-lg">
      <p className="text-sm font-serif font-bold mb-1.5">{label}</p>
      {payload
        .filter((p) => p.value != null)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <span
              className="w-2 h-2 flex-shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-cream/70 truncate flex-1">{entry.dataKey}</span>
            <span className="font-bold tabular-nums">{fmt(entry.value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function Chart({ chartData, seriesKeys, metric }) {
  if (!chartData.length || !seriesKeys.length) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-muted">
        <svg className="w-16 h-16 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
        </svg>
        <p className="text-sm italic">Select a university, school, and degree to see trends</p>
      </div>
    );
  }

  const metricInfo = METRICS[metric];
  const isPercent = metricInfo?.unit === '%';

  return (
    <div className="h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <defs>
            {seriesKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getEditorialColor(i)} stopOpacity={0.25} />
                <stop offset="100%" stopColor={getEditorialColor(i)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6B6560', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={{ stroke: '#1A1A1A', strokeWidth: 1 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B6560', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => isPercent ? `${v}%` : `$${(v / 1000).toFixed(1)}k`}
            domain={isPercent ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: '#D4D0C8', strokeDasharray: '4 4' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 16, fontFamily: 'DM Sans' }}
            iconType="circle"
            iconSize={8}
          />
          {seriesKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getEditorialColor(i)}
              strokeWidth={2.5}
              fill={`url(#gradient-${i})`}
              dot={{ r: 3, strokeWidth: 0, fill: getEditorialColor(i) }}
              activeDot={{ r: 6, strokeWidth: 3, stroke: '#FAF8F5', fill: getEditorialColor(i) }}
              connectNulls
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
