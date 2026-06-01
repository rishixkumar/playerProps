import { useCallback, useEffect, useRef, useState } from 'react';
import './NewsPage.css';

// ---------------------------------------------------------------------------
// Fallback data (used when newsService is unavailable or returns empty)
// ---------------------------------------------------------------------------
const FALLBACK_NEWS = [
  {
    id: '1',
    headline: 'A.J. Brown traded to New England Patriots',
    summary:
      'The Eagles send star WR A.J. Brown to the Patriots in a blockbuster deal. Brown, 27, recorded 1,079 receiving yards in 2024. New England sends a 1st-round pick and a 3rd-round pick back to Philadelphia.',
    url: null,
    publishedAt: 'Jun 1, 2026',
    source: 'ESPN',
    imageUrl: null,
    category: 'TRADE',
    tags: ['AJ Brown', 'Patriots', 'Eagles'],
  },
  {
    id: '2',
    headline: 'Patrick Mahomes signs record extension with Kansas City Chiefs',
    summary:
      'KC locks up their franchise QB through 2032 in a deal that sets a new NFL record for guaranteed money.',
    url: null,
    publishedAt: 'May 28, 2026',
    source: 'NFL.com',
    imageUrl: null,
    category: 'CONTRACT',
    tags: ['Mahomes', 'Chiefs', 'Kansas City'],
  },
  {
    id: '3',
    headline: "Ja'Marr Chase becomes highest-paid WR in NFL history",
    summary:
      "Cincinnati agrees to a 5-year, $185M extension with Chase after his second consecutive 1,700+ yard season.",
    url: null,
    publishedAt: 'May 20, 2026',
    source: 'The Athletic',
    imageUrl: null,
    category: 'CONTRACT',
    tags: ['Chase', 'Bengals', 'Cincinnati'],
  },
  {
    id: '4',
    headline: '2026 NFL Draft: Three QBs taken in top 5',
    summary:
      "The 2026 NFL Draft saw historic QB demand, with Clemson's Marcus Holt going No. 1 overall to Tennessee.",
    url: null,
    publishedAt: 'Apr 24, 2026',
    source: 'NFL.com',
    imageUrl: null,
    category: 'DRAFT',
    tags: ['NFL Draft', '2026 Draft', 'Quarterbacks'],
  },
  {
    id: '5',
    headline: 'Dak Prescott released by Dallas Cowboys after 10 seasons',
    summary:
      'Dallas makes a stunning offseason move, parting ways with franchise QB Dak Prescott, opening the door for a youth movement.',
    url: null,
    publishedAt: 'Mar 15, 2026',
    source: 'ESPN',
    imageUrl: null,
    category: 'NEWS',
    tags: ['Prescott', 'Cowboys', 'Dallas'],
  },
  {
    id: '6',
    headline: 'Lamar Jackson wins record 3rd NFL MVP award',
    summary:
      'Baltimore Ravens QB Lamar Jackson claimed his third league MVP, the most by any player since Peyton Manning.',
    url: null,
    publishedAt: 'Feb 10, 2026',
    source: 'NFL.com',
    imageUrl: null,
    category: 'NEWS',
    tags: ['Lamar Jackson', 'Ravens', 'MVP'],
  },
  {
    id: '7',
    headline: 'Super Bowl LX: Chiefs defeat Eagles 31-24 in overtime thriller',
    summary:
      'Patrick Mahomes threw for 341 yards and 3 TDs as Kansas City won their third consecutive Super Bowl title.',
    url: null,
    publishedAt: 'Feb 2, 2026',
    source: 'ESPN',
    imageUrl: null,
    category: 'GAME',
    tags: ['Super Bowl', 'Chiefs', 'Eagles', 'Mahomes'],
  },
  {
    id: '8',
    headline: 'CeeDee Lamb: 2,000 receiving yards in a single season',
    summary:
      'CeeDee Lamb surpassed the 2,000-yard barrier in the 2025 regular season, becoming only the second player in NFL history to accomplish the feat.',
    url: null,
    publishedAt: 'Jan 5, 2026',
    source: 'The Athletic',
    imageUrl: null,
    category: 'NEWS',
    tags: ['CeeDee Lamb', 'Cowboys', 'Record'],
  },
];

const EASTER_EGG_28_3 = {
  id: 'ee-28-3',
  headline: 'The Greatest Comeback in Super Bowl History: 28-3',
  summary:
    "Super Bowl LI (February 5, 2017): The New England Patriots trailed the Atlanta Falcons 28-3 in the third quarter, then rallied to win 34-28 in overtime — the first OT game in Super Bowl history. Tom Brady threw for 466 yards and 2 TDs. Matt Ryan's 25-point lead became the biggest blown lead in championship game history.",
  url: 'https://en.wikipedia.org/wiki/Super_Bowl_LI',
  publishedAt: 'Feb 5, 2017',
  source: 'History',
  imageUrl: null,
  category: 'GAME',
  tags: ['Patriots', 'Falcons', 'Tom Brady', 'Super Bowl LI', '28-3', 'Comeback'],
};

const SUGGESTION_CHIPS = [
  'AJ Brown trade',
  'Mahomes',
  '28-3',
  '2026 Draft',
  'Injuries',
  'Trades',
];

const CATEGORY_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Trades', value: 'TRADE' },
  { label: 'Contracts', value: 'CONTRACT' },
  { label: 'Injuries', value: 'INJURY' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Games', value: 'GAME' },
];

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------
const CATEGORY_META = {
  TRADE:    { label: 'Trade',    color: '#38bdf8', bg: 'rgba(56,189,248,0.15)'    },
  CONTRACT: { label: 'Contract', color: '#4ade80', bg: 'rgba(74,222,128,0.15)'    },
  INJURY:   { label: 'Injury',   color: '#f87171', bg: 'rgba(248,113,113,0.15)'   },
  DRAFT:    { label: 'Draft',    color: '#c084fc', bg: 'rgba(192,132,252,0.15)'   },
  GAME:     { label: 'Game',     color: '#fb923c', bg: 'rgba(251,146,60,0.15)'    },
  NEWS:     { label: 'News',     color: '#a1a1aa', bg: 'rgba(161,161,170,0.15)'   },
};

function getCategoryMeta(cat) {
  return CATEGORY_META[cat] || CATEGORY_META.NEWS;
}

function formatDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return str;
  }
}

// ---------------------------------------------------------------------------
// Debounce hook
// ---------------------------------------------------------------------------
function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Skeleton component
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="news-card news-card--skeleton" aria-hidden>
      <div className="news-sk news-sk--img" />
      <div className="news-card__body">
        <div className="news-sk news-sk--pill" />
        <div className="news-sk news-sk--h1" />
        <div className="news-sk news-sk--h2" />
        <div className="news-sk news-sk--text" />
        <div className="news-sk news-sk--text news-sk--short" />
      </div>
    </div>
  );
}

function SkeletonHit() {
  return (
    <div className="news-hit news-hit--skeleton" aria-hidden>
      <div className="news-sk news-sk--dot" />
      <div className="news-hit__body">
        <div className="news-sk news-sk--hit-h" />
        <div className="news-sk news-sk--hit-sub" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article card (main feed)
// ---------------------------------------------------------------------------
function ArticleCard({ article, isEasterEgg }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(article.category);

  function handleClick() {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    } else {
      setExpanded((p) => !p);
    }
  }

  const gradientStyle = {
    background: `linear-gradient(135deg, ${meta.bg} 0%, rgba(26,26,30,0.8) 100%)`,
  };

  return (
    <article
      className={`news-card${isEasterEgg ? ' news-card--easter-egg' : ''} news-card--animate`}
      onClick={handleClick}
      role={article.url ? 'link' : 'button'}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={article.headline}
    >
      {/* Image / placeholder */}
      <div className="news-card__img-wrap">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            className="news-card__img"
            loading="lazy"
          />
        ) : (
          <div className="news-card__img-ph" style={gradientStyle}>
            <span className="news-card__img-ph-label" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
        )}
      </div>

      <div className="news-card__body">
        <div className="news-card__top-row">
          <span
            className="news-pill"
            style={{ color: meta.color, background: meta.bg }}
          >
            {meta.label}
          </span>
          <div className="news-card__actions">
            <button
              type="button"
              className="news-icon-btn"
              aria-label="Share"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>

        <h2 className="news-card__headline">{article.headline}</h2>

        <p className={`news-card__summary${expanded ? ' news-card__summary--expanded' : ''}`}>
          {article.summary}
        </p>

        {!article.url && (
          <button
            type="button"
            className="news-card__expand-btn"
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="news-tags">
            {article.tags.map((tag) => (
              <span key={tag} className="news-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="news-card__footer">
          <span className="news-card__source">{article.source}</span>
          <span className="news-card__dot" aria-hidden>·</span>
          <span className="news-card__date">{formatDate(article.publishedAt)}</span>
          {article.url && (
            <span className="news-card__external" aria-hidden>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Quick-hit sidebar row
// ---------------------------------------------------------------------------
function QuickHit({ article }) {
  const meta = getCategoryMeta(article.category);

  function handleClick() {
    if (article.url) window.open(article.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div
      className="news-hit news-hit--animate"
      onClick={handleClick}
      role={article.url ? 'link' : 'article'}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <span
        className="news-hit__dot"
        style={{ background: meta.color }}
        aria-label={meta.label}
      />
      <div className="news-hit__body">
        <p className="news-hit__headline">{article.headline}</p>
        <span className="news-hit__meta">
          {article.source}
          <span aria-hidden> · </span>
          {formatDate(article.publishedAt)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function NewsPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 400);
  const [mainArticles, setMainArticles] = useState(FALLBACK_NEWS);
  const [sideArticles, setSideArticles] = useState(FALLBACK_NEWS.slice(0, 5));
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchRef = useRef(null);

  // Try to load service, fall back gracefully
  const fetchFromService = useCallback(async (q) => {
    try {
      const mod = await import('../services/newsService');
      if (q) {
        const results = await mod.fetchNews(q);
        return results && results.length > 0 ? results : null;
      } else {
        const results = await mod.fetchHeadlines();
        return results && results.length > 0 ? results : null;
      }
    } catch {
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchFromService('');
      if (!cancelled) {
        if (data) {
          setMainArticles(data);
          setSideArticles(data.slice(0, 6));
        } else {
          setMainArticles(FALLBACK_NEWS);
          setSideArticles(FALLBACK_NEWS.slice(0, 5));
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchFromService]);

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setIsSearchMode(false);
      setMainArticles(FALLBACK_NEWS);
      return;
    }

    let cancelled = false;
    setIsSearchMode(true);
    setActiveFilter('ALL');

    // Easter egg
    if (debouncedQuery.trim() === '28-3') {
      setMainArticles([EASTER_EGG_28_3, ...FALLBACK_NEWS.filter((a) => a.id !== EASTER_EGG_28_3.id)]);
      return;
    }

    (async () => {
      setLoading(true);
      const data = await fetchFromService(debouncedQuery);
      if (!cancelled) {
        if (data) {
          setMainArticles(data);
        } else {
          // Client-side filter of fallback data
          const q = debouncedQuery.toLowerCase();
          const filtered = FALLBACK_NEWS.filter(
            (a) =>
              a.headline.toLowerCase().includes(q) ||
              a.summary.toLowerCase().includes(q) ||
              a.tags.some((t) => t.toLowerCase().includes(q)) ||
              a.category.toLowerCase().includes(q)
          );
          setMainArticles(filtered);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedQuery, fetchFromService]);

  // Apply category filter to displayed articles
  const displayedArticles = activeFilter === 'ALL'
    ? mainArticles
    : mainArticles.filter((a) => a.category === activeFilter);

  const isEasterEgg28 = query.trim() === '28-3';

  return (
    <div className="news-page">
      {/* ------------------------------------------------------------------ */}
      {/* Header / search area                                                */}
      {/* ------------------------------------------------------------------ */}
      <header className="news-header">
        <div className="news-header__glow" aria-hidden />
        <div className="news-header__inner">
          <p className="news-header__eyebrow">NFL · News &amp; Analysis</p>
          <h1 className="news-header__title">
            NFL <span className="news-header__accent">News</span>
          </h1>
          <p className="news-header__sub">
            Search players, teams, topics, or historic moments
          </p>

          <div className="news-search">
            <div className="news-search__wrap">
              <svg
                className="news-search__icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                className="news-search__input"
                placeholder='Try "AJ Brown", "Chiefs", "28-3", "2026 Draft"…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search NFL news"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="news-search__clear"
                  aria-label="Clear search"
                  onClick={() => { setQuery(''); searchRef.current?.focus(); }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestion chips */}
            <div className="news-chips" role="list" aria-label="Search suggestions">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={`news-chip${query === chip ? ' news-chip--active' : ''}`}
                  role="listitem"
                  onClick={() => setQuery(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Body: two-column layout                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="news-body">
        {/* Main feed */}
        <main className="news-feed" aria-label="News feed">
          {/* Category filter chips */}
          {!isSearchMode && (
            <div className="news-filters" role="tablist" aria-label="Filter by category">
              {CATEGORY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`news-filter-chip${activeFilter === f.value ? ' news-filter-chip--active' : ''}`}
                  role="tab"
                  aria-selected={activeFilter === f.value}
                  onClick={() => setActiveFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {isSearchMode && (
            <div className="news-search-banner">
              <span className="news-search-banner__label">
                Results for <strong>"{query}"</strong>
              </span>
              <button
                type="button"
                className="news-search-banner__clear"
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="news-feed__list">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Zero results */}
          {!loading && displayedArticles.length === 0 && (
            <div className="news-empty">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <p>
                {isSearchMode
                  ? `No stories found for "${query}". Try a team name, player, or keyword.`
                  : 'No stories in this category yet.'}
              </p>
            </div>
          )}

          {/* Articles */}
          {!loading && displayedArticles.length > 0 && (
            <div className="news-feed__list">
              {displayedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isEasterEgg={isEasterEgg28 && article.id === 'ee-28-3'}
                />
              ))}
            </div>
          )}
        </main>

        {/* Quick hits sidebar */}
        <aside className="news-sidebar" aria-label="Quick hits">
          <h2 className="news-sidebar__heading">Quick Hits</h2>
          <div className="news-sidebar__list">
            {loading
              ? [1, 2, 3, 4, 5].map((i) => <SkeletonHit key={i} />)
              : sideArticles.map((article) => (
                  <QuickHit key={article.id} article={article} />
                ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
