import './StatQueryBar.css';

const CHIPS = ['Yards', 'TDs', 'INTs', 'CMP%', 'Rating', 'ANY/A'];

/**
 * @param {{
 *   query: string,
 *   onQueryChange: (q: string) => void,
 *   activeChips: string[],
 *   onChipToggle: (chip: string) => void,
 *   activeTokenSummary?: string,
 * }} props
 */
export function StatQueryBar({ query, onQueryChange, activeChips, onChipToggle, activeTokenSummary }) {
  return (
    <div className="stat-query player-page__panel">
      <h2 className="player-page__panel-title">Stat lookup</h2>
      <p className="stat-query__hint">
        Narrow the season table and comparison module by label. Chips add common filters; combine
        with text (e.g. &quot;rush&quot;, &quot;DEN&quot; for matchups).
      </p>
      {activeTokenSummary && (
        <p className="stat-query__active" aria-live="polite">
          Active filters: <strong>{activeTokenSummary}</strong>
        </p>
      )}
      <div className="stat-query__row">
        <div className="stat-query__input-wrap">
          <svg
            className="stat-query__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            className="stat-query__input"
            placeholder="Filter stats (e.g. yds, td, rating, DEN)…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Filter stats in tables below"
          />
        </div>
      </div>
      <div className="stat-query__chips" role="group" aria-label="Quick stat filters">
        {CHIPS.map((c) => {
          const active = activeChips.includes(c);
          return (
            <button
              key={c}
              type="button"
              className={`stat-query__chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => onChipToggle(c)}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
