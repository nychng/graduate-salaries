import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { METRICS, getDegreeColor } from '../lib/data';

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const fmt = METRICS[metric]?.format || ((v) => v);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload
        .filter((p) => p.value != null)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 truncate flex-1">{entry.dataKey}</span>
            <span className="font-semibold text-gray-900">{fmt(entry.value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function Chart({ chartData, seriesKeys, metric }) {
  if (!chartData.length || !seriesKeys.length) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400 text-sm">
        Select a university, school, and degree to see trends
      </div>
    );
  }

  const metricInfo = METRICS[metric];
  const isPercent = metricInfo?.unit === '%';

  return (
    <div className="h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(v) => isPercent ? `${v}%` : `$${(v / 1000).toFixed(1)}k`}
            domain={isPercent ? [0, 100] : ['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
          />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getDegreeColor(i)}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: getDegreeColor(i) }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
