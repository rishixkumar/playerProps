import { useState } from 'react';
import './SubViewTabs.css';
import { SeasonRecapTable } from './SeasonRecapTable';

function GameLogTable({ games }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
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
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.week}>
              <td>{g.week}</td>
              <td>{g.opp}</td>
              <td>{g.result}</td>
              <td className="tabular-nums">{g.cmp}</td>
              <td className="tabular-nums">{g.att}</td>
              <td className="tabular-nums">{g.yds}</td>
              <td className="tabular-nums">{g.td}</td>
              <td className="tabular-nums">{g.int}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatchupTable({ rows }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Opponent</th>
            <th scope="col">G</th>
            <th scope="col">Yds</th>
            <th scope="col">TD</th>
            <th scope="col">INT</th>
            <th scope="col">Rating</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.opp}>
              <td>vs {r.opp}</td>
              <td className="tabular-nums">{r.games}</td>
              <td className="tabular-nums">{r.yds}</td>
              <td className="tabular-nums">{r.td}</td>
              <td className="tabular-nums">{r.int}</td>
              <td className="tabular-nums">{r.rating.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'gamelog', label: 'Game log' },
  { id: 'matchups', label: 'Matchups' },
];

export function SubViewTabs({ seasons, games, matchups }) {
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
        {tab === 'overview' && <SeasonRecapTable seasons={seasons} />}
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
        {tab === 'matchups' && <MatchupTable rows={matchups} />}
      </div>
    </section>
  );
}
