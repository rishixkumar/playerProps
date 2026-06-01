import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MOCK_PLAYERS } from '../mock/player';
import './TopNav.css';

const APP_TABS = [
  { to: '/player/demo-qb', label: 'Player', end: false },
  { to: '/props', label: 'Props', disabled: true },
  { to: '/news', label: 'News', disabled: true },
];

function pathMatchesTab(pathname, to) {
  if (to === '/player/demo-qb') return pathname.startsWith('/player');
  return pathname === to;
}

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [openSuggest, setOpenSuggest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_PLAYERS.slice(0, 5);
    return MOCK_PLAYERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q)
    );
  }, [query]);

  function selectPlayer(id) {
    setQuery('');
    setOpenSuggest(false);
    setMenuOpen(false);
    navigate(`/player/${id}`);
  }

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
              placeholder="Search players…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenSuggest(true);
              }}
              onFocus={() => setOpenSuggest(true)}
              onBlur={() => {
                setTimeout(() => setOpenSuggest(false), 150);
              }}
              aria-label="Search players"
              autoComplete="off"
            />
            {openSuggest && filtered.length > 0 && (
              <ul className="top-nav__suggestions" role="listbox">
                {filtered.map((p) => (
                  <li key={p.id} role="presentation">
                    <button
                      type="button"
                      className="top-nav__suggestion"
                      role="option"
                      aria-selected="false"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectPlayer(p.id)}
                    >
                      {p.name}
                      <span className="top-nav__suggestion-meta">
                        {p.position} · {p.team}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav className="top-nav__tabs" aria-label="Main">
            {APP_TABS.map((tab) => {
              const active = pathMatchesTab(location.pathname, tab.to);
              if (tab.disabled) {
                return (
                  <span
                    key={tab.label}
                    className="top-nav__tab"
                    aria-disabled="true"
                  >
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
            placeholder="Search players…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenSuggest(true);
            }}
            aria-label="Search players"
          />
          {openSuggest && filtered.length > 0 && (
            <ul className="top-nav__suggestions" role="listbox">
              {filtered.map((p) => (
                <li key={p.id} role="presentation">
                  <button
                    type="button"
                    className="top-nav__suggestion"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectPlayer(p.id)}
                  >
                    {p.name}
                    <span className="top-nav__suggestion-meta">
                      {p.position} · {p.team}
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
