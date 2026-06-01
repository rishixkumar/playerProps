import { useCallback, useEffect, useRef, useState } from 'react';
import { PropPlayerCard, PropsSlipPanel, PropsTabLoadingState } from '../../components/props';
import { getFallbackTabPlayers, findFallbackPropPlayerByNameQuery } from '../../mocks/propsMocks';
import { getPropsForTab, PROPS_TAB_LIMIT, searchPlayerProps } from '../../services/propsService';
import { preloadPlayerHeadshots } from '../../utils/preloadMedia';
import { getPropsTabBlurb, PROPS_TABS } from './propsPageConfig';
import './PropsPage.css';

export function PropsPage() {
  const [activeTab, setActiveTab] = useState('Featured');
  const [tabPlayers, setTabPlayers] = useState([]);
  const [tabLoad, setTabLoad] = useState({ status: 'loading', phase: 'fetching' });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [slip, setSlip] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setTabLoad({ status: 'loading', phase: 'fetching' });
      setTabPlayers([]);

      let list = [];
      try {
        list = await getPropsForTab(activeTab);
      } catch {
        list = [];
      }
      if (cancelled) return;

      if (!list?.length) {
        list = getFallbackTabPlayers(6);
      }

      setTabLoad({ status: 'loading', phase: 'assets' });
      await preloadPlayerHeadshots(list);
      if (cancelled) return;

      setTabPlayers(list);
      setTabLoad({ status: 'ready', phase: 'idle' });
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      const q = searchQuery.trim();
      if (!q) return;
      setSearching(true);
      setSearchError(null);
      setSearchResult(null);
      try {
        let card = await searchPlayerProps(q);
        if (!card) {
          card = findFallbackPropPlayerByNameQuery(q);
        }
        if (card) {
          await preloadPlayerHeadshots([card]);
          setSearchResult(card);
        } else {
          setSearchError(`No props found for "${q}".`);
        }
      } catch {
        const card = findFallbackPropPlayerByNameQuery(q);
        if (card) {
          await preloadPlayerHeadshots([card]);
          setSearchResult(card);
        } else {
          setSearchError(`No props found for "${q}".`);
        }
      } finally {
        setSearching(false);
      }
    },
    [searchQuery]
  );

  const handleSlipChange = useCallback(({ playerId, statLabel, line, unit, side, odds }) => {
    setSlip((prev) => {
      const filtered = prev.filter(
        (item) => !(item.playerId === playerId && item.statLabel === statLabel)
      );
      if (side === null) return filtered;
      return [...filtered, { playerId, statLabel, line, unit, side, odds }];
    });
  }, []);

  const handleSlipClear = () => setSlip([]);
  const handleSlipRemove = (idx) => setSlip((prev) => prev.filter((_, i) => i !== idx));

  const displayedPlayers = tabPlayers;

  return (
    <div className="pp-page">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                type="button"
                className="pp-search-clear"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResult(null);
                  setSearchError(null);
                  searchInputRef.current?.focus();
                }}
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

      {searchResult && (
        <div className="pp-spotlight-wrap">
          <div className="pp-spotlight-bar">
            <span className="pp-spotlight-label">Search result</span>
            <button
              type="button"
              className="pp-back-btn"
              onClick={() => {
                setSearchResult(null);
                setSearchQuery('');
              }}
            >
              ← Back to {activeTab}
            </button>
          </div>
          <PropPlayerCard player={searchResult} spotlight onSlipChange={handleSlipChange} />
        </div>
      )}

      {searchError && (
        <div className="pp-search-error">
          <span className="pp-search-error-icon">⚠</span>
          {searchError}
        </div>
      )}

      <div className="pp-section-head">
        <div className="pp-section-title-row">
          <h2 className="pp-section-title">
            {activeTab}
            <span className="pp-title-dot"> · </span>
            Top {PROPS_TAB_LIMIT}
          </h2>
        </div>
        <p className="pp-season-note">
          {getPropsTabBlurb(activeTab)} Refreshed each time you open a tab.
        </p>
        <div className="pp-tabs" role="tablist">
          {PROPS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
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

      {tabLoad.status === 'loading' ? (
        <PropsTabLoadingState phase={tabLoad.phase} />
      ) : displayedPlayers.length === 0 ? (
        <div className="pp-empty">No props available for this filter.</div>
      ) : (
        <div className="pp-grid">
          {displayedPlayers.map((player) => (
            <PropPlayerCard key={player.espnId} player={player} onSlipChange={handleSlipChange} />
          ))}
        </div>
      )}

      <PropsSlipPanel slip={slip} onClear={handleSlipClear} onRemove={handleSlipRemove} />
    </div>
  );
}
