import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ensureNflPlayerIndex, searchPlayerIndex } from '../services/nflPlayerIndex';
import './HomePage.css';

const SPOTLIGHT = [
  { id: 'espn-3139477', name: 'Patrick Mahomes', team: 'KC', role: 'QB' },
  { id: 'espn-3915511', name: 'Joe Burrow', team: 'CIN', role: 'QB' },
  { id: 'espn-3918298', name: 'Josh Allen', team: 'BUF', role: 'QB' },
  { id: 'espn-3116406', name: 'Tyreek Hill', team: 'MIA', role: 'WR' },
];

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 220);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [open, setOpen] = useState(false);
  const indexOnce = useRef(false);

  const loadIndex = useCallback(async () => {
    if (indexOnce.current) return;
    indexOnce.current = true;
    setLoading(true);
    setErr(null);
    try {
      const { players: list } = await ensureNflPlayerIndex();
      setPlayers(list);
    } catch (e) {
      indexOnce.current = false;
      setErr(e.message || 'Could not load roster index');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => searchPlayerIndex(players, debounced, 10), [players, debounced]);

  useEffect(() => {
    if (open) loadIndex();
  }, [open, loadIndex]);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden />
        <div className="home-hero__inner">
          <p className="home-hero__eyebrow">NFL · Player intelligence</p>
          <h1 className="home-hero__title">
            Build smarter reads on <span className="home-hero__accent">every skill player</span>
          </h1>
          <p className="home-hero__lead">
            Search the full league roster (cached ESPN data), open a live profile with season
            trends, splits, and matchup history — then layer props and news in upcoming releases.
          </p>

          <div className="home-search">
            <label className="sr-only" htmlFor="home-player-search">
              Search NFL players
            </label>
            <div className="home-search__wrap">
              <svg className="home-search__icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                id="home-player-search"
                type="search"
                className="home-search__input"
                placeholder="Try “Burrow”, “Chiefs WR”, or a team code…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => {
                  setOpen(true);
                  loadIndex();
                }}
                onBlur={() => setTimeout(() => setOpen(false), 160)}
                autoComplete="off"
              />
            </div>
            {open && (
              <ul className="home-search__results" role="listbox" aria-label="Search results">
                {loading && <li className="home-search__meta">Loading roster index…</li>}
                {err && <li className="home-search__err">{err}</li>}
                {!loading &&
                  filtered.map((p) => (
                    <li key={p.espnId} role="presentation">
                      <button
                        type="button"
                        className="home-search__hit"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setQuery('');
                          setOpen(false);
                          navigate(`/player/${p.routeId}`);
                        }}
                      >
                        {p.headshotHref ? (
                          <img src={p.headshotHref} alt="" className="home-search__thumb" />
                        ) : (
                          <span className="home-search__thumb home-search__thumb--ph">
                            {p.displayName?.charAt(0)}
                          </span>
                        )}
                        <span>
                          <span className="home-search__name">{p.displayName}</span>
                          <span className="home-search__sub">
                            {p.positionAbbr} · {p.teamAbbr}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                {!loading && !err && query.trim() && filtered.length === 0 && (
                  <li className="home-search__meta">No players match.</li>
                )}
              </ul>
            )}
          </div>

          <div className="home-hero__actions">
            <Link to="/player/espn-3139477" className="home-btn home-btn--primary">
              Open live profile (demo)
            </Link>
            <Link to="/player/demo-qb" className="home-btn home-btn--ghost">
              Static layout reference
            </Link>
          </div>
        </div>
      </section>

      <section className="home-spotlight" aria-labelledby="spotlight-heading">
        <div className="home-section-head">
          <h2 id="spotlight-heading">Spotlight profiles</h2>
          <p>Jump straight into real ESPN-backed pages.</p>
        </div>
        <div className="home-spotlight__grid">
          {SPOTLIGHT.map((p) => (
            <Link key={p.id} to={`/player/${p.id}`} className="home-card">
              <span className="home-card__role">{p.role}</span>
              <span className="home-card__name">{p.name}</span>
              <span className="home-card__team">{p.team}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-features" aria-labelledby="features-heading">
        <div className="home-section-head">
          <h2 id="features-heading">What works today</h2>
          <p>Shipped data paths — no placeholder chrome.</p>
        </div>
        <ul className="home-features__list">
          <li>
            <strong>Roster search</strong>
            <span>All teams, debounced filtering, headshots from ESPN.</span>
          </li>
          <li>
            <strong>Live player route</strong>
            <span>
              <code>/player/espn-{'{id}'}</code> pulls core bio, season grids, gamelog shell, and
              opponent splits.
            </span>
          </li>
          <li>
            <strong>Stat type tabs</strong>
            <span>
              Every ESPN stat group for that player (passing, rushing, receiving, defense, etc.),
              with a position-aware default (e.g. WR opens on receiving).
            </span>
          </li>
          <li>
            <strong>Stat lookup</strong>
            <span>Filters comparison + season columns + matchups by text and chips.</span>
          </li>
          <li>
            <strong>Bio enrichment</strong>
            <span>TheSportsDB long-form copy when ESPN id cross-matches.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
