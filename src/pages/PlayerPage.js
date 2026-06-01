import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMockPlayer } from '../mock/player';
import { loadLivePlayerViewModel } from '../services/playerDataOrchestrator';
import { parsePlayerRouteId } from '../utils/playerRouteId';
import {
  filterComparisonItems,
  filterMatchupRows,
  filterSeasonRecap,
  normalizeStatTokens,
} from '../utils/statFilter';
import { PlayerIdentityPanel } from '../components/PlayerIdentityPanel';
import { PlayerBioPanel } from '../components/PlayerBioPanel';
import { StatCategoryPicker } from '../components/StatCategoryPicker';
import { StatQueryBar } from '../components/StatQueryBar';
import { ComparisonSection } from '../components/ComparisonSection';
import { SubViewTabs } from '../components/SubViewTabs';
import './PlayerPage.css';

/** Normalize older mock payloads that lack `statViews`. */
function resolveStatBundle(data) {
  const views = data.statViews;
  const order = data.statCategoryOrder;
  if (views && order?.length) {
    return {
      order,
      views,
      defaultKey: data.defaultStatCategory || order[0],
    };
  }

  const matchupGrid = {
    columns: [
      { key: 'a', label: 'Pass Yds' },
      { key: 'b', label: 'Pass TD' },
      { key: 'c', label: 'INT' },
      { key: 'd', label: 'Rating' },
    ],
    rows: (data.matchups || []).map((m) => ({
      opp: m.opp,
      games: m.games ?? null,
      a: String(m.yds ?? '—'),
      b: String(m.td ?? '—'),
      c: String(m.int ?? '—'),
      d: typeof m.rating === 'number' ? m.rating.toFixed(1) : String(m.rating ?? '—'),
    })),
    footnote: 'Mock data: passer-style split columns.',
  };

  const legacyView = {
    key: 'passing',
    title: 'Passing',
    highlights: data.highlights || [],
    comparison: data.comparison || [],
    seasons: data.seasons || [],
    seasonRecap: data.seasonRecap ?? null,
    matchupGrid,
  };

  return { order: ['passing'], views: { passing: legacyView }, defaultKey: 'passing' };
}

export function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statQuery, setStatQuery] = useState('');
  const [statChips, setStatChips] = useState([]);
  const [statCategory, setStatCategory] = useState(null);

  useEffect(() => {
    const parsed = parsePlayerRouteId(id);
    let cancelled = false;
    setError(null);
    setStatQuery('');
    setStatChips([]);
    setStatCategory(null);

    if (parsed.kind === 'mock') {
      setLoading(true);
      setData(getMockPlayer(parsed.id));
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (parsed.kind === 'espn') {
      setLoading(true);
      setData(null);
      loadLivePlayerViewModel(parsed.espnId)
        .then((vm) => {
          if (!cancelled) {
            setData(vm);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e.message || 'Failed to load player');
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    setLoading(false);
    setError(`Unknown player route "${parsed.raw}". Try search or /player/demo-qb.`);
    setData(null);
    return undefined;
  }, [id]);

  const statTokens = useMemo(
    () => normalizeStatTokens(statQuery, statChips),
    [statQuery, statChips]
  );

  const { order: statOrder, views: statViews, defaultKey: statDefaultKey } = useMemo(
    () => (data ? resolveStatBundle(data) : { order: [], views: {}, defaultKey: null }),
    [data]
  );

  const activeStatKey = useMemo(() => {
    if (!statOrder.length) return null;
    if (statCategory && statViews[statCategory]) return statCategory;
    return statDefaultKey || statOrder[0];
  }, [statCategory, statDefaultKey, statOrder, statViews]);

  const activeView = useMemo(() => {
    if (!activeStatKey) return null;
    return statViews[activeStatKey] || statViews[statOrder[0]] || null;
  }, [activeStatKey, statOrder, statViews]);

  const filteredComparison = useMemo(() => {
    if (!activeView?.comparison) return [];
    return filterComparisonItems(activeView.comparison, statTokens);
  }, [activeView, statTokens]);

  const filteredSeasonRecap = useMemo(() => {
    const recap = activeView?.seasonRecap;
    if (!recap) return null;
    return filterSeasonRecap(recap, statTokens);
  }, [activeView, statTokens]);

  const filteredMatchupGrid = useMemo(() => {
    const grid = activeView?.matchupGrid;
    if (!grid?.rows?.length) return grid || { columns: [], rows: [], footnote: null };
    const rows = filterMatchupRows(grid.rows, statTokens);
    return { ...grid, rows };
  }, [activeView, statTokens]);

  const tokenSummary = useMemo(() => {
    if (!statTokens.length) return '';
    return statTokens.slice(0, 8).join(', ') + (statTokens.length > 8 ? '…' : '');
  }, [statTokens]);

  const toggleChip = useCallback((chip) => {
    setStatChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  }, []);

  if (loading) {
    return (
      <div className="player-page player-page--state">
        <p className="player-page__state-msg">Loading player…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="player-page player-page--state">
        <p className="player-page__state-msg" role="alert">
          {error || 'No data'}
        </p>
      </div>
    );
  }

  if (!activeView) {
    return (
      <div className="player-page player-page--state">
        <p className="player-page__state-msg" role="status">
          No stat categories returned for this player.
        </p>
      </div>
    );
  }

  return (
    <div className="player-page">
      <div className="player-page__grid">
        <PlayerIdentityPanel
          profile={data.profile}
          highlights={activeView.highlights}
          newsHeadline={data.newsHeadline}
        />
        <div className="player-page__main">
          <PlayerBioPanel sportsdb={data.sportsdb} />
          {statOrder.length > 1 && (
            <StatCategoryPicker
              order={statOrder}
              views={statViews}
              activeKey={activeStatKey}
              onChange={setStatCategory}
            />
          )}
          <StatQueryBar
            query={statQuery}
            onQueryChange={setStatQuery}
            activeChips={statChips}
            onChipToggle={toggleChip}
            activeTokenSummary={tokenSummary}
          />
          <ComparisonSection items={filteredComparison} filterActive={statTokens.length > 0} />
          <SubViewTabs
            seasons={activeView.seasons}
            seasonRecap={filteredSeasonRecap ?? activeView.seasonRecap}
            games={data.games}
            matchupGrid={filteredMatchupGrid}
          />
        </div>
      </div>
    </div>
  );
}
