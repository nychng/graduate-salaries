import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import MetricSelector, { FOOTNOTES } from './components/MetricSelector';
import Chart from './components/Chart';
import DataTable from './components/DataTable';
import ShareButton from './components/ShareButton';
import { useUrlState } from './hooks/useUrlState';
import { getFilteredData, getChartData, METRICS, getReclassificationNote } from './lib/data';

function App() {
  const [state, update] = useUrlState();

  const hasSelection = state.degrees.length > 0;
  const filtered = hasSelection
    ? getFilteredData(state.universities, state.schools, state.degrees)
    : [];
  const { chartData, seriesKeys } = getChartData(filtered, state.metric);
  const metricLabel = METRICS[state.metric]?.label || state.metric;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Filters */}
        <section className="py-6 border-b border-rule">
          <FilterPanel state={state} onUpdate={update} />
        </section>

        {/* Metric selector */}
        <section className="py-5 border-b border-rule">
          <MetricSelector
            selected={state.metric}
            onChange={(m) => update({ metric: m })}
          />
        </section>

        {/* Chart */}
        <section className="py-6 border-b border-rule">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-ink">
              {metricLabel}
              {hasSelection ? '' : (
                <span className="font-sans text-sm font-normal text-muted italic ml-2">
                  select filters above
                </span>
              )}
            </h2>
            {hasSelection && <ShareButton />}
          </div>
          <Chart chartData={chartData} seriesKeys={seriesKeys} metric={state.metric} />
          {hasSelection && (() => {
            const note = getReclassificationNote(
              state.universities[0], state.schools[0], state.degrees[0]
            );
            return note ? (
              <p className="mt-4 text-xs text-accent border-l-2 border-accent pl-3 py-1 italic">
                {note}
              </p>
            ) : null;
          })()}
        </section>

        {/* Data table */}
        {hasSelection && (
          <section className="py-6 border-b border-rule">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">
              Data
              <span className="font-sans text-xs font-normal text-muted ml-2">
                {filtered.length} records
              </span>
            </h2>
            <DataTable data={filtered} metric={state.metric} />
          </section>
        )}

        {/* Footer */}
        <footer className="py-8 space-y-4">
          <div className="space-y-1">
            {FOOTNOTES.map((fn, i) => (
              <p key={fn.label} className="text-[10px] leading-snug text-muted">
                <sup className="text-accent">{i + 1}</sup> {fn.text}
              </p>
            ))}
          </div>
          <div className="border-t border-rule pt-4">
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-semibold text-ink">Data reclassifications:</span> Some degrees have been reclassified across schools or renamed over the years to maintain a continuous time series. See the full list of <a href="/blog/data-reclassifications/" className="text-accent hover:underline">data reclassifications</a> for details. If you spot any errors, please let us know.
            </p>
          </div>
          <p className="text-center text-[10px] text-muted pt-2">
            Data source: MOE Singapore Graduate Employment Survey. Updated yearly.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
