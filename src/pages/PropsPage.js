import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeaturedProps, searchPlayerProps } from '../services/propsService';
import './PropsPage.css';

// ─── fallback mock data ──────────────────────────────────────────────────────
const MOCK_PROPS = [
  {
    espnId: '4685382', displayName: 'Jaxon Smith-Njigba', position: 'WR', teamAbbr: 'SEA',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4685382.png',
    teamColor: '#002a5c',
    props: [
      { statLabel: 'Receiving Yards', line: 72.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 72.5 }, { name: 'Underdog', line: 71.5 }, { name: 'Sleeper', line: 73 }], projection: 79.1 },
      { statLabel: 'Receptions', line: 5.5, unit: 'REC', overOdds: '-120', underOdds: '+100', sources: [{ name: 'PrizePicks', line: 5.5 }, { name: 'Underdog', line: 5 }, { name: 'Sleeper', line: 6 }], projection: 5.8 },
      { statLabel: 'Touchdowns', line: 0.5, unit: 'TDS', overOdds: '+140', underOdds: '-180', sources: [{ name: 'PrizePicks', line: 0.5 }, { name: 'Sleeper', line: 0.5 }], projection: 0.52 },
    ],
  },
  {
    espnId: '3139477', displayName: 'Patrick Mahomes', position: 'QB', teamAbbr: 'KC',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png',
    teamColor: '#e31837',
    props: [
      { statLabel: 'Passing Yards', line: 274.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 274.5 }, { name: 'Underdog', line: 271.5 }, { name: 'Sleeper', line: 276 }], projection: 281.2 },
      { statLabel: 'Pass TDs', line: 2.5, unit: 'TDS', overOdds: '-130', underOdds: '+110', sources: [{ name: 'PrizePicks', line: 2.5 }, { name: 'Underdog', line: 2.5 }, { name: 'Sleeper', line: 2.5 }], projection: 2.7 },
      { statLabel: 'Completions', line: 24.5, unit: 'CMP', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 24.5 }, { name: 'Underdog', line: 25 }, { name: 'Sleeper', line: 24 }], projection: 25.8 },
    ],
  },
  {
    espnId: '4362628', displayName: "Ja'Marr Chase", position: 'WR', teamAbbr: 'CIN',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4362628.png',
    teamColor: '#fb4f14',
    props: [
      { statLabel: 'Receiving Yards', line: 88.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 88.5 }, { name: 'Underdog', line: 87 }, { name: 'Sleeper', line: 90 }], projection: 96.3 },
      { statLabel: 'Receptions', line: 6.5, unit: 'REC', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 6.5 }, { name: 'Underdog', line: 6 }, { name: 'Sleeper', line: 7 }], projection: 6.9 },
      { statLabel: 'Touchdowns', line: 0.5, unit: 'TDS', overOdds: '+130', underOdds: '-160', sources: [{ name: 'PrizePicks', line: 0.5 }, { name: 'Sleeper', line: 0.5 }], projection: 0.71 },
    ],
  },
  {
    espnId: '3918298', displayName: 'Josh Allen', position: 'QB', teamAbbr: 'BUF',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/3918298.png',
    teamColor: '#00338d',
    props: [
      { statLabel: 'Passing Yards', line: 259.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 259.5 }, { name: 'Underdog', line: 258 }, { name: 'Sleeper', line: 261 }], projection: 267.4 },
      { statLabel: 'Rush Yards', line: 39.5, unit: 'YDS', overOdds: '-120', underOdds: '+100', sources: [{ name: 'PrizePicks', line: 39.5 }, { name: 'Underdog', line: 38 }, { name: 'Sleeper', line: 40 }], projection: 44.1 },
      { statLabel: 'Pass TDs', line: 2.5, unit: 'TDS', overOdds: '-120', underOdds: '+100', sources: [{ name: 'PrizePicks', line: 2.5 }, { name: 'Underdog', line: 2.5 }], projection: 2.6 },
    ],
  },
  {
    espnId: '4047646', displayName: 'CeeDee Lamb', position: 'WR', teamAbbr: 'DAL',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4047646.png',
    teamColor: '#003594',
    props: [
      { statLabel: 'Receiving Yards', line: 81.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 81.5 }, { name: 'Underdog', line: 80 }, { name: 'Sleeper', line: 82 }, { name: 'Chalkboard', line: 81 }], projection: 85.2 },
      { statLabel: 'Receptions', line: 7.5, unit: 'REC', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 7.5 }, { name: 'Underdog', line: 7 }, { name: 'Sleeper', line: 7.5 }], projection: 7.1 },
    ],
  },
  {
    espnId: '4035538', displayName: 'Justin Jefferson', position: 'WR', teamAbbr: 'MIN',
    headshotUrl: 'https://a.espncdn.com/i/headshots/nfl/players/full/4035538.png',
    teamColor: '#4f2683',
    props: [
      { statLabel: 'Receiving Yards', line: 84.5, unit: 'YDS', overOdds: '-115', underOdds: '-115', sources: [{ name: 'PrizePicks', line: 84.5 }, { name: 'Underdog', line: 84 }, { name: 'Sleeper', line: 85 }], projection: 88.7 },
      { statLabel: 'Receptions', line: 6.5, unit: 'REC', overOdds: '-110', underOdds: '-120', sources: [{ name: 'PrizePicks', line: 6.5 }, { name: 'Sleeper', line: 6 }], projection: 6.2 },
    ],
  },
];

const TABS = ['Featured', 'QB Props', 'WR Props', 'RB Props', 'Best Value'];

function filterByTab(players, tab) {
  if (tab === 'Featured') return players;
  if (tab === 'QB Props') return players.filter(p => p.position === 'QB');
  if (tab === 'WR Props') return players.filter(p => p.position === 'WR');
  if (tab === 'RB Props') return players.filter(p => p.position === 'RB');
  if (tab === 'Best Value') {
    return players.filter(p =>
      p.props.some(pr => pr.projection > pr.line * 1.07 || pr.projection < pr.line * 0.93)
    );
  }
  return players;
}

// ─── Projection bar ──────────────────────────────────────────────────────────
function ProjectionBar({ projection, line }) {
  const fill = Math.min(projection / (line * 2), 1);
  const isOver = projection >= line;
  return (
    <div className="pp-proj-bar-track">
      <div
        className="pp-proj-bar-fill"
        style={{
          width: `${fill * 100}%`,
          background: isOver ? 'var(--color-positive)' : 'var(--color-negative)',
        }}
      />
      <span className="pp-proj-label" style={{ color: isOver ? 'var(--color-positive)' : 'var(--color-negative)' }}>
        Proj {projection}
      </span>
    </div>
  );
}

// ─── Single prop line row ─────────────────────────────────────────────────────
function PropLineRow({ propLine, playerId, onSlipChange }) {
  const [picked, setPicked] = useState(null); // 'over' | 'under' | null

  const handle = (side) => {
    const next = picked === side ? null : side;
    setPicked(next);
    onSlipChange({ playerId, statLabel: propLine.statLabel, line: propLine.line, unit: propLine.unit, side: next, odds: side === 'over' ? propLine.overOdds : propLine.underOdds });
  };

  return (
    <div className="pp-prop-row">
      <div className="pp-prop-row-top">
        <span className="pp-stat-label">{propLine.statLabel}</span>
        <span className="pp-line-value">{propLine.line} <span className="pp-unit">{propLine.unit}</span></span>
        <div className="pp-toggle-group">
          <button
            className={`pp-toggle-btn pp-over${picked === 'over' ? ' pp-toggle-active-over' : ''}`}
            onClick={() => handle('over')}
          >
            ↑ {propLine.overOdds}
          </button>
          <button
            className={`pp-toggle-btn pp-under${picked === 'under' ? ' pp-toggle-active-under' : ''}`}
            onClick={() => handle('under')}
          >
            ↓ {propLine.underOdds}
          </button>
        </div>
      </div>
      <ProjectionBar projection={propLine.projection} line={propLine.line} />
      <div className="pp-sources-row">
        {propLine.sources.map(s => (
          <span key={s.name} className="pp-source-chip">{s.name} <span className="pp-source-line">{s.line}</span></span>
        ))}
      </div>
    </div>
  );
}

// ─── Player card ─────────────────────────────────────────────────────────────
function PropPlayerCard({ player, spotlight, onSlipChange }) {
  return (
    <div className={`pp-card${spotlight ? ' pp-card-spotlight' : ''}`}>
      <div className="pp-card-header" style={{ background: player.teamColor }}>
        <div className="pp-card-header-overlay" />
        {player.headshotUrl ? (
          <img
            className="pp-headshot"
            src={player.headshotUrl}
            alt={player.displayName}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="pp-headshot pp-headshot-placeholder">
            {player.displayName.charAt(0)}
          </div>
        )}
      </div>
      <div className="pp-card-body">
        <div className="pp-player-meta">
          <span className="pp-player-name">{player.displayName}</span>
          <div className="pp-player-badges">
            <span className="pp-badge pp-badge-pos">{player.position}</span>
            <span className="pp-badge pp-badge-team">{player.teamAbbr}</span>
          </div>
        </div>
        <div className="pp-props-list">
          {player.props.map((pr, i) => (
            <PropLineRow
              key={i}
              propLine={pr}
              playerId={player.espnId}
              onSlipChange={onSlipChange}
            />
          ))}
        </div>
        <div className="pp-powered-by">
          <span className="pp-powered-label">Lines from</span>
          {['PrizePicks', 'Underdog', 'Sleeper', 'Chalkboard'].filter(src =>
            player.props.some(pr => pr.sources.some(s => s.name === src))
          ).map(src => (
            <span key={src} className="pp-source-badge">{src}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="pp-card pp-skeleton">
      <div className="pp-skeleton-header" />
      <div className="pp-card-body">
        <div className="pp-skeleton-line pp-skeleton-name" />
        <div className="pp-skeleton-line pp-skeleton-short" />
        <div className="pp-skeleton-prop" />
        <div className="pp-skeleton-prop" />
        <div className="pp-skeleton-prop" />
      </div>
    </div>
  );
}

// ─── Slip panel ───────────────────────────────────────────────────────────────
function SlipPanel({ slip, onClear, onRemove }) {
  const [open, setOpen] = useState(false);
  const count = slip.length;

  return (
    <>
      <button
        className={`pp-slip-fab${count > 0 ? ' pp-slip-fab-active' : ''}`}
        onClick={() => setOpen(o => !o)}
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
                <button className="pp-slip-clear" onClick={onClear}>Clear all</button>
              )}
              <button className="pp-slip-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
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
                    <span className="pp-slip-item-line">{item.line} {item.unit}</span>
                  </div>
                  <div className="pp-slip-item-right">
                    <span className={`pp-slip-side pp-slip-side-${item.side}`}>
                      {item.side === 'over' ? '↑ OVER' : '↓ UNDER'}
                    </span>
                    <span className="pp-slip-odds">{item.odds}</span>
                    <button className="pp-slip-remove" onClick={() => onRemove(i)} aria-label="Remove">✕</button>
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

// ─── Main page ────────────────────────────────────────────────────────────────
export function PropsPage() {
  const [activeTab, setActiveTab] = useState('Featured');
  const [featuredPlayers, setFeaturedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [slip, setSlip] = useState([]);
  const searchInputRef = useRef(null);

  // Load featured props
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFeaturedProps()
      .then(data => {
        if (cancelled) return;
        setFeaturedPlayers(data && data.length > 0 ? data : MOCK_PROPS);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFeaturedPlayers(MOCK_PROPS);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const result = await searchPlayerProps(q);
      if (result) {
        setSearchResult(result);
      } else {
        const local = MOCK_PROPS.find(p =>
          p.displayName.toLowerCase().includes(q.toLowerCase())
        );
        if (local) {
          setSearchResult(local);
        } else {
          setSearchError(`No props found for "${q}".`);
        }
      }
    } catch {
      const local = MOCK_PROPS.find(p =>
        p.displayName.toLowerCase().includes(q.toLowerCase())
      );
      if (local) {
        setSearchResult(local);
      } else {
        setSearchError(`No props found for "${q}".`);
      }
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSlipChange = useCallback(({ playerId, statLabel, line, unit, side, odds }) => {
    setSlip(prev => {
      const filtered = prev.filter(
        item => !(item.playerId === playerId && item.statLabel === statLabel)
      );
      if (side === null) return filtered;
      return [...filtered, { playerId, statLabel, line, unit, side, odds }];
    });
  }, []);

  const handleSlipClear = () => setSlip([]);
  const handleSlipRemove = (idx) => setSlip(prev => prev.filter((_, i) => i !== idx));

  const displayedPlayers = filterByTab(featuredPlayers, activeTab);

  return (
    <div className="pp-page">
      {/* Search bar */}
      <div className="pp-search-wrap">
        <form className="pp-search-form" onSubmit={handleSearch}>
          <div className="pp-search-inner">
            <span className="pp-search-icon">⌕</span>
            <input
              ref={searchInputRef}
              className="pp-search-input"
              type="text"
              placeholder="Search player props… e.g. Ja'Marr Chase"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                type="button"
                className="pp-search-clear"
                onClick={() => { setSearchQuery(''); setSearchResult(null); setSearchError(null); searchInputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button className="pp-search-btn" type="submit" disabled={searching}>
            {searching ? <span className="pp-spinner" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Search result spotlight */}
      {searchResult && (
        <div className="pp-spotlight-wrap">
          <div className="pp-spotlight-bar">
            <span className="pp-spotlight-label">Search result</span>
            <button
              className="pp-back-btn"
              onClick={() => { setSearchResult(null); setSearchQuery(''); }}
            >
              ← Back to featured
            </button>
          </div>
          <PropPlayerCard
            player={searchResult}
            spotlight
            onSlipChange={handleSlipChange}
          />
        </div>
      )}

      {searchError && (
        <div className="pp-search-error">
          <span className="pp-search-error-icon">⚠</span>
          {searchError}
        </div>
      )}

      {/* Season notice + tabs */}
      <div className="pp-section-head">
        <div className="pp-section-title-row">
          <h2 className="pp-section-title">Featured props <span className="pp-title-dot">·</span> Off-season projections</h2>
        </div>
        <p className="pp-season-note">
          NFL season currently off. Lines show per-game projections based on 2024 season averages and market consensus.
        </p>
        <div className="pp-tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`pp-tab${activeTab === tab ? ' pp-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      {error ? (
        <div className="pp-error">
          <span className="pp-error-icon">⚡</span>
          <p>{error}</p>
          <button className="pp-retry-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : loading ? (
        <div className="pp-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayedPlayers.length === 0 ? (
        <div className="pp-empty">No props available for this filter.</div>
      ) : (
        <div className="pp-grid">
          {displayedPlayers.map(player => (
            <PropPlayerCard
              key={player.espnId}
              player={player}
              onSlipChange={handleSlipChange}
            />
          ))}
        </div>
      )}

      {/* Slip panel */}
      <SlipPanel slip={slip} onClear={handleSlipClear} onRemove={handleSlipRemove} />
    </div>
  );
}
