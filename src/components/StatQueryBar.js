import { useState } from 'react';
import './StatQueryBar.css';

const CHIPS = ['Yards', 'TDs', 'INTs', 'CMP%', 'Rating', 'ANY/A'];

export function StatQueryBar() {
  const [q, setQ] = useState('');
  const [activeChip, setActiveChip] = useState(null);

  return (
    <div className="stat-query player-page__panel">
      <h2 className="player-page__panel-title">Stat lookup</h2>
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
            placeholder="Ask about a stat (visual only)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Filter or search stats"
          />
        </div>
      </div>
      <div className="stat-query__chips" role="group" aria-label="Quick stat filters">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            className={`stat-query__chip${activeChip === c ? ' is-active' : ''}`}
            onClick={() => setActiveChip((prev) => (prev === c ? null : c))}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
