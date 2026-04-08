import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import MetricSelector, { FOOTNOTES } from './components/MetricSelector';
import Chart from './components/Chart';
import DataTable from './components/DataTable';
import ShareButton from './components/ShareButton';
import { useUrlState } from './hooks/useUrlState';
import { getFilteredData, getChartData, METRICS } from './lib/data';

function App() {
  const [state, update] = useUrlState();

  const hasSelection = state.degrees.length > 0;
  const filtered = hasSelection
    ? getFilteredData(state.universities, state.schools, state.degrees)
    : [];
  const { chartData, seriesKeys } = getChartData(filtered, state.metric);
  const metricLabel = METRICS[state.metric]?.label || state.metric;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filters */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <FilterPanel state={state} onUpdate={update} />
        </section>

        {/* Metric selector */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <MetricSelector
            selected={state.metric}
            onChange={(m) => update({ metric: m })}
          />
        </section>

        {/* Chart */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {metricLabel}
              {hasSelection ? '' : ' — select filters above to compare'}
            </h2>
            {hasSelection && <ShareButton />}
          </div>
          <Chart chartData={chartData} seriesKeys={seriesKeys} metric={state.metric} />
        </section>

        {/* Data table */}
        {hasSelection && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Data ({filtered.length} records)
            </h2>
            <DataTable data={filtered} metric={state.metric} />
          </section>
        )}

        {/* Footer */}
        <footer className="text-xs text-gray-400 py-4 space-y-2">
          <div className="space-y-1">
            {FOOTNOTES.map((fn, i) => (
              <p key={fn.label} className="text-[10px] leading-snug">
                <sup>{i + 1}</sup> {fn.text}
              </p>
            ))}
          </div>
          <p className="text-center">
            Data source: MOE Singapore Graduate Employment Survey. Updated yearly.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
