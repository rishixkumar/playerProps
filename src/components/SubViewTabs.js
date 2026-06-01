import { useState } from 'react';
import './SubViewTabs.css';
import { SeasonRecapTable } from './SeasonRecapTable';

function GameLogTable({ games }) {
  if (!games?.length) {
    return <p className="sub-tabs__hint">No game log rows available.</p>;
  }
  const compact = games[0]?.cmp === '—';
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          {compact ? (
            <tr>
              <th scope="col">Week</th>
              <th scope="col">Opp</th>
              <th scope="col">Result</th>
            </tr>
          ) : (
            <tr>
              <th scope="col">Week</th>
              <th scope="col">Opp</th>
              <th scope="col">Result</th>
              <th scope="col">Cmp</th>
              <th scope="col">Att</th>
              <th scope="col">Yds</th>
              <th scope="col">TD</th>
              <th scope="col">INT</th>
            </tr>
          )}
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={`${g.week}-${g.opp}`}>
              <td>{g.week}</td>
              <td>{g.opp}</td>
              {compact ? (
                <td>{g.result}</td>
              ) : (
                <>
                  <td>{g.result}</td>
                  <td className="tabular-nums">{g.cmp}</td>
                  <td className="tabular-nums">{g.att}</td>
                  <td className="tabular-nums">{g.yds}</td>
                  <td className="tabular-nums">{g.td}</td>
                  <td className="tabular-nums">{g.int}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {compact && (
        <p className="sub-tabs__hint">
          Per-game passing lines require an extra box-score join; this grid shows schedule
          outcomes from ESPN gamelog now.
        </p>
      )}
    </div>
  );
}

function formatMatchupGames(g) {
  if (g == null) return '—';
  return g;
}

function MatchupTable({ matchupGrid }) {
  const { columns = [], rows = [], footnote } = matchupGrid || {};

  if (!rows?.length) {
    return (
      <p className="sub-tabs__hint">
        No opponent split rows for this stat type yet. ESPN sometimes omits splits for depth roles
        or early in the season; try another stat tab or check back after games are logged.
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Opponent</th>
            <th scope="col">G</th>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.opp}>
              <td>vs {r.opp}</td>
              <td className="tabular-nums">{formatMatchupGames(r.games)}</td>
              {columns.map((c) => (
                <td key={c.key} className="tabular-nums">
                  {r[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footnote && <p className="sub-tabs__hint">{footnote}</p>}
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'gamelog', label: 'Game log' },
  { id: 'matchups', label: 'Matchups' },
];

export function SubViewTabs({ seasons, seasonRecap, games, matchupGrid }) {
  const [tab, setTab] = useState('overview');

  return (
    <section className="sub-tabs player-page__panel" aria-label="Player stat views">
      <ul className="sub-tabs__list" role="tablist">
        {TABS.map((t) => (
          <li key={t.id} role="presentation">
            <button
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`sub-tabs__tab${tab === t.id ? ' is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      <div
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={tab !== 'overview'}
        className="sub-tabs__panel"
      >
        {tab === 'overview' && (
          <SeasonRecapTable seasons={seasons} seasonRecap={seasonRecap} />
        )}
      </div>
      <div
        id="panel-gamelog"
        role="tabpanel"
        aria-labelledby="tab-gamelog"
        hidden={tab !== 'gamelog'}
        className="sub-tabs__panel"
      >
        {tab === 'gamelog' && <GameLogTable games={games} />}
      </div>
      <div
        id="panel-matchups"
        role="tabpanel"
        aria-labelledby="tab-matchups"
        hidden={tab !== 'matchups'}
        className="sub-tabs__panel"
      >
        {tab === 'matchups' && <MatchupTable matchupGrid={matchupGrid} />}
      </div>
    </section>
  );
}
