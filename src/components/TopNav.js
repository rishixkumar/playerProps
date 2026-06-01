import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ensureNflPlayerIndex, searchPlayerIndex } from '../services/nflPlayerIndex';
import './TopNav.css';

const APP_TABS = [
  { to: '/player/espn-3139477', label: 'Player', end: false },
  { to: '/props', label: 'Props', disabled: true },
  { to: '/news', label: 'News', disabled: true },
];

function pathMatchesTab(pathname, to) {
  if (to === '/player/espn-3139477') return pathname.startsWith('/player');
  return pathname === to;
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 220);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexError, setIndexError] = useState(null);
  const [players, setPlayers] = useState([]);
  const indexRequested = useRef(false);

  const ensureIndex = useCallback(async () => {
    if (indexRequested.current) return;
    indexRequested.current = true;
    setIndexLoading(true);
    setIndexError(null);
    try {
      const { players: list } = await ensureNflPlayerIndex();
      setPlayers(list);
    } catch (e) {
      indexRequested.current = false;
      setIndexError(e.message || 'Could not load NFL roster index');
    } finally {
      setIndexLoading(false);
    }
  }, []);

  useEffect(() => {
    if (openSuggest || menuOpen) {
      ensureIndex();
    }
  }, [openSuggest, menuOpen, ensureIndex]);

  const filtered = useMemo(() => {
    return searchPlayerIndex(players, debouncedQuery, 12);
  }, [players, debouncedQuery]);

  function selectPlayer(routeId) {
    setQuery('');
    setOpenSuggest(false);
    setMenuOpen(false);
    navigate(`/player/${routeId}`);
  }

  const showList = openSuggest && (query.trim() || filtered.length > 0);

  return (
    <>
      <header className="top-nav" role="banner">
        <div className="top-nav__inner">
          <Link to="/" className="top-nav__brand">
            Playerprops
          </Link>

          <div className="top-nav__search-wrap">
            <svg
              className="top-nav__search-icon"
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
              className="top-nav__search"
              placeholder="Search NFL players (ESPN roster index)…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenSuggest(true);
              }}
              onFocus={() => {
                setOpenSuggest(true);
                ensureIndex();
              }}
              onBlur={() => {
                setTimeout(() => setOpenSuggest(false), 180);
              }}
              aria-label="Search NFL players"
              autoComplete="off"
            />
            {showList && (
              <ul className="top-nav__suggestions" role="listbox" aria-label="Player search results">
                {indexLoading && (
                  <li className="top-nav__suggestion-meta top-nav__suggestion-pad">
                    Loading roster index (32 teams)…
                  </li>
                )}
                {indexError && (
                  <li className="top-nav__suggestion-meta top-nav__suggestion-pad top-nav__suggestion-error">
                    {indexError}
                  </li>
                )}
                {!indexLoading &&
                  filtered.map((p) => (
                    <li key={p.espnId} role="presentation">
                      <button
                        type="button"
                        className="top-nav__suggestion top-nav__suggestion--rich"
                        role="option"
                        aria-selected="false"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectPlayer(p.routeId)}
                      >
                        {p.headshotHref ? (
                          <img
                            src={p.headshotHref}
                            alt=""
                            className="top-nav__suggestion-photo"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <span className="top-nav__suggestion-photo top-nav__suggestion-photo--ph" aria-hidden>
                            {p.displayName?.slice(0, 1)}
                          </span>
                        )}
                        <span className="top-nav__suggestion-main">
                          <span className="top-nav__suggestion-name">{p.displayName}</span>
                          <span className="top-nav__suggestion-meta">
                            {p.positionAbbr} · {p.teamAbbr}
                            <span className="top-nav__suggestion-pill">ESPN</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                {!indexLoading && !indexError && query.trim() && filtered.length === 0 && (
                  <li className="top-nav__suggestion-meta top-nav__suggestion-pad">No players match.</li>
                )}
              </ul>
            )}
          </div>

          <nav className="top-nav__tabs" aria-label="Main">
            {APP_TABS.map((tab) => {
              const active = pathMatchesTab(location.pathname, tab.to);
              if (tab.disabled) {
                return (
                  <span key={tab.label} className="top-nav__tab" aria-disabled="true">
                    {tab.label}
                  </span>
                );
              }
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`top-nav__tab${active ? ' top-nav__tab--active' : ''}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="top-nav__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="top-nav-drawer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              {menuOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <div
        id="top-nav-drawer"
        className={`top-nav__drawer${menuOpen ? ' is-open' : ''}`}
        hidden={!menuOpen}
      >
        <div className="top-nav__search-wrap">
          <svg
            className="top-nav__search-icon"
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
            className="top-nav__search"
            placeholder="Search NFL players…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSuggest(true);
              ensureIndex();
            }}
            onFocus={() => {
              setOpenSuggest(true);
              ensureIndex();
            }}
            aria-label="Search NFL players"
          />
          {showList && (
            <ul className="top-nav__suggestions" role="listbox">
              {indexLoading && (
                <li className="top-nav__suggestion-meta top-nav__suggestion-pad">Loading…</li>
              )}
              {indexError && (
                <li className="top-nav__suggestion-meta top-nav__suggestion-pad">{indexError}</li>
              )}
              {!indexLoading &&
                filtered.map((p) => (
                  <li key={p.espnId} role="presentation">
                    <button
                      type="button"
                      className="top-nav__suggestion top-nav__suggestion--rich"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPlayer(p.routeId)}
                    >
                      {p.headshotHref ? (
                        <img
                          src={p.headshotHref}
                          alt=""
                          className="top-nav__suggestion-photo"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="top-nav__suggestion-photo top-nav__suggestion-photo--ph" aria-hidden>
                          {p.displayName?.slice(0, 1)}
                        </span>
                      )}
                      <span className="top-nav__suggestion-main">
                        <span className="top-nav__suggestion-name">{p.displayName}</span>
                        <span className="top-nav__suggestion-meta">
                          {p.positionAbbr} · {p.teamAbbr}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="top-nav__drawer-tabs">
          {APP_TABS.map((tab) => {
            const active = pathMatchesTab(location.pathname, tab.to);
            if (tab.disabled) {
              return (
                <span key={tab.label} className="top-nav__tab" aria-disabled="true">
                  {tab.label}
                </span>
              );
            }
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`top-nav__tab${active ? ' top-nav__tab--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
