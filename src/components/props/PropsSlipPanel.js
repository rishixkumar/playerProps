import { useState } from 'react';

export function PropsSlipPanel({ slip, onClear, onRemove }) {
  const [open, setOpen] = useState(false);
  const count = slip.length;

  return (
    <>
      <button
        type="button"
        className={`pp-slip-fab${count > 0 ? ' pp-slip-fab-active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="My Slip"
      >
        <span className="pp-slip-icon">🎯</span>
        {count > 0 && <span className="pp-slip-count">{count}</span>}
        <span className="pp-slip-fab-label">My Slip</span>
      </button>
      {open && (
        <div className="pp-slip-panel">
          <div className="pp-slip-header">
            <span className="pp-slip-title">My Slip</span>
            <div className="pp-slip-header-actions">
              {count > 0 && (
                <button type="button" className="pp-slip-clear" onClick={onClear}>
                  Clear all
                </button>
              )}
              <button
                type="button"
                className="pp-slip-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
          {count === 0 ? (
            <p className="pp-slip-empty">No picks yet. Hit Over or Under on any prop.</p>
          ) : (
            <ul className="pp-slip-list">
              {slip.map((item, i) => (
                <li key={i} className="pp-slip-item">
                  <div className="pp-slip-item-info">
                    <span className="pp-slip-item-stat">{item.statLabel}</span>
                    <span className="pp-slip-item-line">
                      {item.line} {item.unit}
                    </span>
                  </div>
                  <div className="pp-slip-item-right">
                    <span className={`pp-slip-side pp-slip-side-${item.side}`}>
                      {item.side === 'over' ? '↑ OVER' : '↓ UNDER'}
                    </span>
                    <span className="pp-slip-odds">{item.odds}</span>
                    <button
                      type="button"
                      className="pp-slip-remove"
                      onClick={() => onRemove(i)}
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
