import { useState } from 'react';
import { PropProjectionBar } from './PropProjectionBar';

export function PropLineRow({ propLine, playerId, onSlipChange }) {
  const [picked, setPicked] = useState(null);

  const handle = (side) => {
    const next = picked === side ? null : side;
    setPicked(next);
    onSlipChange({
      playerId,
      statLabel: propLine.statLabel,
      line: propLine.line,
      unit: propLine.unit,
      side: next,
      odds: side === 'over' ? propLine.overOdds : propLine.underOdds,
    });
  };

  return (
    <div className="pp-prop-row">
      <div className="pp-prop-row-top">
        <span className="pp-stat-label">{propLine.statLabel}</span>
        <span className="pp-line-value">
          {propLine.line} <span className="pp-unit">{propLine.unit}</span>
        </span>
        <div className="pp-toggle-group">
          <button
            type="button"
            className={`pp-toggle-btn pp-over${picked === 'over' ? ' pp-toggle-active-over' : ''}`}
            onClick={() => handle('over')}
          >
            ↑ {propLine.overOdds}
          </button>
          <button
            type="button"
            className={`pp-toggle-btn pp-under${picked === 'under' ? ' pp-toggle-active-under' : ''}`}
            onClick={() => handle('under')}
          >
            ↓ {propLine.underOdds}
          </button>
        </div>
      </div>
      <PropProjectionBar projection={propLine.projection} line={propLine.line} />
      <div className="pp-sources-row">
        {propLine.sources.map((s) => (
          <span key={s.name} className="pp-source-chip">
            {s.name} <span className="pp-source-line">{s.line}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
