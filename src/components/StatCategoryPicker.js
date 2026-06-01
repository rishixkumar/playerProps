import './StatCategoryPicker.css';

/**
 * @param {{
 *   order: string[],
 *   views: Record<string, { title: string }>,
 *   activeKey: string,
 *   onChange: (key: string) => void,
 * }} props
 */
export function StatCategoryPicker({ order, views, activeKey, onChange }) {
  if (!order?.length) return null;

  return (
    <div className="stat-cat-picker player-page__panel" aria-label="ESPN stat category">
      <div className="stat-cat-picker__head">
        <h2 className="player-page__panel-title">Stat type</h2>
        <p className="stat-cat-picker__hint">
          ESPN returns every stat group this player has logged (e.g. receiving plus occasional
          passing). Pick a tab to refresh highlights, season table, comparisons, and opponent
          splits for that group.
        </p>
      </div>
      <div className="stat-cat-picker__scroll" role="tablist">
        {order.map((key) => {
          const label = views[key]?.title || key;
          const selected = key === activeKey;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`stat-cat-picker__tab${selected ? ' is-active' : ''}`}
              onClick={() => onChange(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
