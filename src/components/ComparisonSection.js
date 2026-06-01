import './ComparisonSection.css';

function formatDelta(player, league) {
  const d = player - league;
  const pct = league !== 0 ? ((d / league) * 100).toFixed(1) : '—';
  const sign = d > 0 ? '+' : '';
  return { text: `${sign}${pct}%`, up: d >= 0 };
}

export function ComparisonSection({ items }) {
  return (
    <section className="comparison player-page__panel" aria-labelledby="compare-heading">
      <h2 id="compare-heading" className="player-page__panel-title">
        Performance vs league
      </h2>
      <p className="comparison__intro">
        Mock baseline = league average for qualified passers. Bar length is scaled to the
        higher of your value and the baseline; the marker shows the league position.
      </p>
      <div className="comparison__legend">
        <span>
          <span className="comparison__swatch comparison__swatch--player" aria-hidden />
          Player
        </span>
        <span>
          <span className="comparison__swatch comparison__swatch--lg" aria-hidden />
          League avg
        </span>
      </div>
      {items.map((row) => {
        const scale = Math.max(row.player, row.leagueAvg) * 1.15 || 1;
        const playerPct = Math.min(100, (row.player / scale) * 100);
        const leaguePct = Math.min(100, (row.leagueAvg / scale) * 100);
        const { text, up } = formatDelta(row.player, row.leagueAvg);
        return (
          <div key={row.key} className="comparison__row">
            <div className="comparison__label-row">
              <span className="comparison__label">{row.label}</span>
              <span className="comparison__values tabular-nums">
                <strong>{row.player}</strong>
                {' vs '}
                {row.leagueAvg}
                <span
                  className={`comparison__delta comparison__delta--${up ? 'up' : 'down'}`}
                >
                  {text}
                </span>
              </span>
            </div>
            <div className="comparison__track" role="presentation">
              <div className="comparison__fill" style={{ width: `${playerPct}%` }} />
              <div
                className="comparison__marker"
                style={{ left: `${leaguePct}%` }}
                title={`League avg ${row.leagueAvg}`}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
