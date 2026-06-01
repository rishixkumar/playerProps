// src/services/propsService.js
// Computes expected per-game prop lines from ESPN 2024 season stats.

import { ensureNflPlayerIndex, searchPlayerIndex } from './nflPlayerIndex';
import { fetchJson } from './http';
import { pickActiveTeamAbbr } from '../utils/espnTeamUtils';

// site.web.api allows CORS * — direct fetch is fine in the browser
const espnStatsUrl = (id) =>
  `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${id}/stats`;

const BY_ATHLETE_STATS_URL =
  'https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/statistics/byathlete';

/** How many player cards to show per tab */
export const PROPS_TAB_LIMIT = 20;

/** How many leaderboard rows to pull before position filtering */
const LEADERBOARD_FETCH = 50;

/** Max players to score for "Best Value" before trimming to PROPS_TAB_LIMIT */
const BEST_VALUE_CANDIDATES = 48;

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_COLORS = {
  KC: '#e31837', BUF: '#00338d', CIN: '#fb4f14', SEA: '#002a5c',
  DAL: '#003594', MIN: '#4f2683', SF: '#aa0000', NE: '#002244',
  PHI: '#004c54', BAL: '#241773', MIA: '#008e97', GB: '#203731',
  DEN: '#fb4f14', LAR: '#003594', TB: '#d50a0a', NO: '#d3bc8d',
};

const SOURCE_NAMES = ['PrizePicks', 'Underdog', 'Sleeper', 'Chalkboard'];

// Per-player mock fallback for when ESPN fetch fails
const MOCK_BY_ID = {
  '3139477': {
    displayName: 'Patrick Mahomes', position: 'QB', teamAbbr: 'KC',
    props: [
      { statLabel: 'Passing Yards', line: 274.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 274.5 }, { name: 'Underdog', line: 271.5 }, { name: 'Sleeper', line: 276 }],
        projection: 281.2 },
      { statLabel: 'Pass TDs', line: 2.5, unit: 'TDS', overOdds: '-130', underOdds: '+110',
        sources: [{ name: 'PrizePicks', line: 2.5 }, { name: 'Underdog', line: 2.5 }, { name: 'Sleeper', line: 2.5 }],
        projection: 2.7 },
      { statLabel: 'Completions', line: 24.5, unit: 'CMP', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 24.5 }],
        projection: 25.8 },
    ],
  },
  '3918298': {
    displayName: 'Josh Allen', position: 'QB', teamAbbr: 'BUF',
    props: [
      { statLabel: 'Passing Yards', line: 254.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 254.5 }, { name: 'Underdog', line: 252.0 }, { name: 'Sleeper', line: 256.5 }],
        projection: 260.3 },
      { statLabel: 'Pass TDs', line: 2.5, unit: 'TDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 2.5 }, { name: 'Underdog', line: 2.5 }, { name: 'Sleeper', line: 2.5 }],
        projection: 2.6 },
      { statLabel: 'Rush Yards', line: 34.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 34.5 }, { name: 'Underdog', line: 33.5 }, { name: 'Sleeper', line: 35.5 }],
        projection: 36.2 },
    ],
  },
  '4362628': {
    displayName: "Ja'Marr Chase", position: 'WR', teamAbbr: 'CIN',
    props: [
      { statLabel: 'Receiving Yards', line: 88.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 88.5 }, { name: 'Underdog', line: 87 }, { name: 'Sleeper', line: 90 }],
        projection: 96.3 },
      { statLabel: 'Receptions', line: 6.5, unit: 'REC', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 6.5 }, { name: 'Underdog', line: 6 }, { name: 'Sleeper', line: 7 }],
        projection: 6.9 },
      { statLabel: 'Touchdowns', line: 0.5, unit: 'TDS', overOdds: '+130', underOdds: '-160',
        sources: [{ name: 'PrizePicks', line: 0.5 }, { name: 'Sleeper', line: 0.5 }],
        projection: 0.71 },
    ],
  },
  '4430878': {
    displayName: 'Jaxon Smith-Njigba', position: 'WR', teamAbbr: 'SEA',
    props: [
      { statLabel: 'Receiving Yards', line: 72.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 72.5 }, { name: 'Underdog', line: 71.5 }, { name: 'Sleeper', line: 73 }],
        projection: 79.1 },
      { statLabel: 'Receptions', line: 5.5, unit: 'REC', overOdds: '-120', underOdds: '+100',
        sources: [{ name: 'PrizePicks', line: 5.5 }, { name: 'Underdog', line: 5 }, { name: 'Sleeper', line: 6 }],
        projection: 5.8 },
      { statLabel: 'Touchdowns', line: 0.5, unit: 'TDS', overOdds: '+140', underOdds: '-180',
        sources: [{ name: 'PrizePicks', line: 0.5 }, { name: 'Sleeper', line: 0.5 }],
        projection: 0.52 },
    ],
  },
  '4241389': {
    displayName: 'CeeDee Lamb', position: 'WR', teamAbbr: 'DAL',
    props: [
      { statLabel: 'Receiving Yards', line: 81.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 81.5 }, { name: 'Underdog', line: 80 }, { name: 'Sleeper', line: 82 }],
        projection: 85.2 },
      { statLabel: 'Receptions', line: 7.5, unit: 'REC', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 7.5 }, { name: 'Underdog', line: 7 }, { name: 'Sleeper', line: 7.5 }],
        projection: 7.1 },
    ],
  },
  '4262921': {
    displayName: 'Justin Jefferson', position: 'WR', teamAbbr: 'MIN',
    props: [
      { statLabel: 'Receiving Yards', line: 84.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 84.5 }, { name: 'Underdog', line: 84 }, { name: 'Sleeper', line: 85 }],
        projection: 88.7 },
      { statLabel: 'Receptions', line: 6.5, unit: 'REC', overOdds: '-110', underOdds: '-120',
        sources: [{ name: 'PrizePicks', line: 6.5 }, { name: 'Sleeper', line: 6 }],
        projection: 6.2 },
    ],
  },
  '3117251': {
    displayName: 'Christian McCaffrey', position: 'RB', teamAbbr: 'SF',
    props: [
      { statLabel: 'Rush Yards', line: 68.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 68.5 }, { name: 'Underdog', line: 67 }, { name: 'Sleeper', line: 69 }],
        projection: 72.4 },
      { statLabel: 'Receptions', line: 5.5, unit: 'REC', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 5.5 }, { name: 'Underdog', line: 5 }, { name: 'Sleeper', line: 6 }],
        projection: 5.2 },
      { statLabel: 'Rush TDs', line: 0.5, unit: 'TDS', overOdds: '+120', underOdds: '-150',
        sources: [{ name: 'PrizePicks', line: 0.5 }, { name: 'Sleeper', line: 0.5 }],
        projection: 0.6 },
    ],
  },
  '3915511': {
    displayName: 'Joe Burrow', position: 'QB', teamAbbr: 'CIN',
    props: [
      { statLabel: 'Passing Yards', line: 268.5, unit: 'YDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 268.5 }, { name: 'Underdog', line: 267 }, { name: 'Sleeper', line: 270 }],
        projection: 275.1 },
      { statLabel: 'Pass TDs', line: 2.5, unit: 'TDS', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 2.5 }, { name: 'Underdog', line: 2.5 }, { name: 'Sleeper', line: 2.5 }],
        projection: 2.4 },
      { statLabel: 'Completions', line: 25.5, unit: 'CMP', overOdds: '-115', underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 25.5 }, { name: 'Sleeper', line: 25 }],
        projection: 26.2 },
    ],
  },
};

// ─── Leaderboard (ESPN statistics/byathlete) ─────────────────────────────────

let cachedSeasonYear = null;

function buildByAthleteUrl({ season, category, sort, limit, page = 1 }) {
  const u = new URL(BY_ATHLETE_STATS_URL);
  u.searchParams.set('region', 'us');
  u.searchParams.set('lang', 'en');
  u.searchParams.set('contentorigin', 'espn');
  u.searchParams.set('isqualified', 'false');
  u.searchParams.set('season', String(season));
  u.searchParams.set('seasontype', '2');
  u.searchParams.set('category', category);
  u.searchParams.set('sort', sort);
  u.searchParams.set('limit', String(limit));
  u.searchParams.set('page', String(page));
  return u.toString();
}

async function resolveSeasonYear() {
  if (cachedSeasonYear != null) return cachedSeasonYear;
  for (const y of [2025, 2024, 2023]) {
    try {
      const url = buildByAthleteUrl({
        season: y,
        category: 'offense:passing',
        sort: 'passing.passingYards:desc',
        limit: 1,
        page: 1,
      });
      const data = await fetchJson(url);
      if (Array.isArray(data?.athletes) && data.athletes.length > 0) {
        cachedSeasonYear = data.requestedSeason?.year ?? y;
        return cachedSeasonYear;
      }
    } catch {
      /* try next year */
    }
  }
  cachedSeasonYear = 2024;
  return cachedSeasonYear;
}

function parseStatNum(v) {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Flatten ESPN `categories[].names` + `values` into a numeric map. */
function namedStatsFromLeaderRow(row) {
  const m = {};
  for (const c of row?.categories || []) {
    const names = c.names || [];
    const vals = c.values;
    if (!names.length || !Array.isArray(vals)) continue;
    names.forEach((name, i) => {
      m[name] = parseStatNum(vals[i]);
    });
  }
  return m;
}

function hintsFromLeaderRow(row) {
  const a = row?.athlete || {};
  const id = a.id != null ? String(a.id) : '';
  const pos = a.position?.abbreviation || '—';
  const team = a.teamShortName || a.teamName || '—';
  return {
    espnId: id,
    displayName: a.displayName || `Player ${id}`,
    position: pos,
    teamAbbr: team,
  };
}

async function fetchLeaderboardRows(season, category, sort, limit = LEADERBOARD_FETCH) {
  const url = buildByAthleteUrl({ season, category, sort, limit, page: 1 });
  const data = await fetchJson(url);
  return Array.isArray(data?.athletes) ? data.athletes : [];
}

async function mapPool(items, limit, mapper) {
  if (!items.length) return [];
  let next = 0;
  const results = new Array(items.length);
  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await mapper(items[i], i);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

function scrimmageYardsFromMap(st) {
  return (
    (st.passingYards || 0) +
    (st.rushingYards || 0) +
    (st.receivingYards || 0)
  );
}

/**
 * Merge passing / rushing / receiving leaderboards and rank everyone who
 * appears on any board by combined scrimmage yards.
 */
async function rankAllByScrimmageYards(season) {
  const [passRows, rushRows, recRows] = await Promise.all([
    fetchLeaderboardRows(season, 'offense:passing', 'passing.passingYards:desc'),
    fetchLeaderboardRows(season, 'offense:rushing', 'rushing.rushingYards:desc'),
    fetchLeaderboardRows(season, 'offense:receiving', 'receiving.receivingYards:desc'),
  ]);

  const merged = new Map();

  const apply = (rows, key) => {
    for (const row of rows) {
      const h = hintsFromLeaderRow(row);
      if (!h.espnId) continue;
      const st = namedStatsFromLeaderRow(row);
      const prev = merged.get(h.espnId) || {
        ...h,
        passingYards: 0,
        rushingYards: 0,
        receivingYards: 0,
      };
      if (key === 'pass') prev.passingYards = Math.max(prev.passingYards, st.passingYards || 0);
      if (key === 'rush') prev.rushingYards = Math.max(prev.rushingYards, st.rushingYards || 0);
      if (key === 'rec') prev.receivingYards = Math.max(prev.receivingYards, st.receivingYards || 0);
      prev.displayName = prev.displayName || h.displayName;
      prev.position = prev.position || h.position;
      prev.teamAbbr = prev.teamAbbr || h.teamAbbr;
      merged.set(h.espnId, prev);
    }
  };

  apply(passRows, 'pass');
  apply(rushRows, 'rush');
  apply(recRows, 'rec');

  return Array.from(merged.values())
    .map((x) => ({
      espnId: x.espnId,
      displayName: x.displayName,
      position: x.position,
      teamAbbr: x.teamAbbr,
      _score: scrimmageYardsFromMap({
        passingYards: x.passingYards,
        rushingYards: x.rushingYards,
        receivingYards: x.receivingYards,
      }),
    }))
    .sort((a, b) => b._score - a._score);
}

async function getFeaturedHints(season, n = PROPS_TAB_LIMIT) {
  const ranked = await rankAllByScrimmageYards(season);
  return ranked.slice(0, n).map(({ _score, ...h }) => h);
}

async function getPositionHintsFromBoard(season, category, sort, filterPos, n = PROPS_TAB_LIMIT) {
  const rows = await fetchLeaderboardRows(season, category, sort);
  const out = [];
  for (const row of rows) {
    const h = hintsFromLeaderRow(row);
    if (!h.espnId) continue;
    const pos = String(h.position || '').toUpperCase();
    if (!filterPos(pos)) continue;
    out.push(h);
    if (out.length >= n) break;
  }
  return out;
}

function valueScoreForPlayer(p) {
  if (!p?.props?.length) return 0;
  let best = 0;
  for (const pr of p.props) {
    const line = Number(pr.line);
    if (!line || line <= 0) continue;
    const edge = Math.abs(Number(pr.projection) - line) / line;
    if (edge > best) best = edge;
  }
  return best;
}

// ─── Math helpers ────────────────────────────────────────────────────────────

/**
 * Floors value to nearest `step` — produces clean betting increments (0.5 or 2.5)
 * set at or just below the true average.
 */
function roundToLine(value, step = 0.5) {
  return Math.floor(value / step) * step;
}

function calcOdds(projection, line) {
  if (projection > line * 1.05) return { overOdds: '-120', underOdds: '+100' };
  if (projection < line * 0.95) return { overOdds: '+100', underOdds: '-120' };
  return { overOdds: '-115', underOdds: '-115' };
}

/**
 * Deterministic variation for simulated source lines — seeded on espnId so
 * every render gives the same values.
 */
function seededRand(seed) {
  // Simple LCG
  const s = ((seed * 1664525 + 1013904223) | 0) >>> 0;
  return s / 0xffffffff;
}

function buildSources(espnId, line, step = 0.5) {
  const id = parseInt(espnId, 10) || 0;
  return SOURCE_NAMES.slice(0, 3).map((name, i) => {
    const r = seededRand(id + i * 7919);
    const delta = r < 0.33 ? -step : r > 0.66 ? step : 0;
    return { name, line: Math.round((line + delta) * 10) / 10 };
  });
}

// ─── ESPN stats parsing ──────────────────────────────────────────────────────

/**
 * Latest season row for a category (max year). Returns stat name → value map or null.
 */
function extractCategoryStats(statsJson, categoryName) {
  const cats = statsJson?.categories;
  if (!Array.isArray(cats)) return null;
  const cat = cats.find((c) => c.name === categoryName);
  if (!cat || !Array.isArray(cat.statistics)) return null;

  const names = cat.names || [];
  const labels = cat.labels || [];
  const statKeys = names.length === labels.length ? names : labels.map((_, i) => `c${i}`);

  const rows = (cat.statistics || []).filter((r) => r?.season?.year != null);
  if (!rows.length) return null;
  rows.sort((a, b) => b.season.year - a.season.year);
  const row = rows[0];

  const stats = row.stats || [];
  const byName = {};
  statKeys.forEach((key, idx) => {
    const raw = stats[idx];
    if (raw == null) {
      byName[key] = 0;
      return;
    }
    const n = parseFloat(String(raw).replace(/,/g, ''));
    byName[key] = Number.isFinite(n) ? n : 0;
  });
  return byName;
}

/** Read a numeric stat; treats missing as 0 (real zeros allowed). */
function statVal(byName, key) {
  if (!byName) return 0;
  const raw = byName[key];
  if (raw == null || raw === '') return 0;
  const n = parseFloat(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function getGamesPlayed(statsJson) {
  let maxGp = 0;
  for (const cat of ['passing', 'rushing', 'receiving', 'miscellaneous', 'scoring', 'defensive']) {
    const s = extractCategoryStats(statsJson, cat);
    if (!s) continue;
    const gp = statVal(s, 'gamesPlayed') || statVal(s, 'GP');
    if (gp > maxGp) maxGp = gp;
  }
  return maxGp > 0 ? maxGp : 17;
}

// ─── Prop line constructors ──────────────────────────────────────────────────

function makePropLine(statLabel, seasonTotal, gp, unit, espnId, step = 0.5) {
  if (!gp || gp <= 0) return null;
  const avg = seasonTotal / gp;
  if (avg <= 0) return null;
  const line = roundToLine(avg, step);
  if (line <= 0) return null;
  const projection = Math.round(avg * 10) / 10;
  const { overOdds, underOdds } = calcOdds(projection, line);
  return { statLabel, line, unit, overOdds, underOdds, sources: buildSources(espnId, line, step), projection };
}

function makeAnytimeTD(avgTDs, espnId) {
  const line = 0.5;
  const projection = Math.round(avgTDs * 10) / 10;
  const { overOdds, underOdds } = calcOdds(projection, line);
  return { statLabel: 'Anytime TD', line, unit: 'TDS', overOdds, underOdds, sources: buildSources(espnId, line, 0.5), projection };
}

// ─── Position-specific prop builders ─────────────────────────────────────────

function buildQBProps(statsJson, espnId) {
  const gp      = getGamesPlayed(statsJson);
  const passing = extractCategoryStats(statsJson, 'passing');
  const rushing = extractCategoryStats(statsJson, 'rushing');
  const props   = [];

  if (passing) {
    const passYdsProp = makePropLine(
      'Passing Yards',
      statVal(passing, 'passingYards'),
      gp,
      'YDS',
      espnId,
      2.5
    );
    if (passYdsProp) props.push(passYdsProp);

    const passTdsProp = makePropLine(
      'Pass TDs',
      statVal(passing, 'passingTouchdowns'),
      gp,
      'TDS',
      espnId,
      0.5
    );
    if (passTdsProp) props.push(passTdsProp);

    const compsProp = makePropLine('Completions', statVal(passing, 'completions'), gp, 'CMP', espnId, 0.5);
    if (compsProp) props.push(compsProp);

    const intsProp = makePropLine('Interceptions', statVal(passing, 'interceptions'), gp, 'INT', espnId, 0.5);
    if (intsProp) props.push(intsProp);
  }

  if (rushing) {
    const rushYdsTotal = statVal(rushing, 'rushingYards');
    const rushAvg = rushYdsTotal / gp;
    if (rushAvg > 15) {
      const rushProp = makePropLine('Rush Yards', rushYdsTotal, gp, 'YDS', espnId, 0.5);
      if (rushProp) props.push(rushProp);
    }
    const rushTdAvg = statVal(rushing, 'rushingTouchdowns') / gp;
    if (rushTdAvg >= 0.35) props.push(makeAnytimeTD(rushTdAvg, espnId));
  }

  return props;
}

function buildWRTEProps(statsJson, espnId, isTE) {
  const gp       = getGamesPlayed(statsJson);
  const receiving = extractCategoryStats(statsJson, 'receiving');
  const props    = [];

  if (receiving) {
    const recYdsProp = makePropLine(
      'Receiving Yards',
      statVal(receiving, 'receivingYards'),
      gp,
      'YDS',
      espnId,
      0.5
    );
    if (recYdsProp) props.push(recYdsProp);

    const recsProp = makePropLine('Receptions', statVal(receiving, 'receptions'), gp, 'REC', espnId, 0.5);
    if (recsProp) props.push(recsProp);

    const tdsProp = makePropLine(
      'Touchdowns',
      statVal(receiving, 'receivingTouchdowns'),
      gp,
      'TDS',
      espnId,
      0.5
    );
    if (tdsProp) props.push(tdsProp);

    if (isTE) {
      const tgtsProp = makePropLine('Targets', statVal(receiving, 'receivingTargets'), gp, 'TGT', espnId, 0.5);
      if (tgtsProp) props.push(tgtsProp);
    }

    const recTdAvg = statVal(receiving, 'receivingTouchdowns') / gp;
    if (recTdAvg >= 0.35) props.push(makeAnytimeTD(recTdAvg, espnId));
  }

  return props;
}

function buildRBProps(statsJson, espnId) {
  const gp       = getGamesPlayed(statsJson);
  const rushing  = extractCategoryStats(statsJson, 'rushing');
  const receiving = extractCategoryStats(statsJson, 'receiving');
  const props    = [];

  if (rushing) {
    const rushProp = makePropLine('Rush Yards', statVal(rushing, 'rushingYards'), gp, 'YDS', espnId, 0.5);
    if (rushProp) props.push(rushProp);

    const rushTdsProp = makePropLine('Rush TDs', statVal(rushing, 'rushingTouchdowns'), gp, 'TDS', espnId, 0.5);
    if (rushTdsProp) props.push(rushTdsProp);
  }

  if (receiving) {
    const recsProp = makePropLine('Receptions', statVal(receiving, 'receptions'), gp, 'REC', espnId, 0.5);
    if (recsProp) props.push(recsProp);

    const recYdsAvg = statVal(receiving, 'receivingYards') / gp;
    if (recYdsAvg > 15) {
      const recYdsProp = makePropLine(
        'Receiving Yards',
        statVal(receiving, 'receivingYards'),
        gp,
        'YDS',
        espnId,
        0.5
      );
      if (recYdsProp) props.push(recYdsProp);
    }
  }

  const rushTds = rushing ? statVal(rushing, 'rushingTouchdowns') / gp : 0;
  const recTds = receiving ? statVal(receiving, 'receivingTouchdowns') / gp : 0;
  const totalTdAvg = rushTds + recTds;
  if (totalTdAvg >= 0.35) props.push(makeAnytimeTD(totalTdAvg, espnId));

  return props;
}

function buildPropsForPosition(statsJson, position, espnId) {
  const pos = String(position || '').toUpperCase().trim();
  if (pos === 'QB') return buildQBProps(statsJson, espnId);
  if (pos === 'TE') return buildWRTEProps(statsJson, espnId, true);
  if (pos === 'WR') return buildWRTEProps(statsJson, espnId, false);
  if (pos === 'RB' || pos === 'FB') return buildRBProps(statsJson, espnId);

  // Unknown position: infer from which categories have data
  const recStats = extractCategoryStats(statsJson, 'receiving');
  const rushStats = extractCategoryStats(statsJson, 'rushing');
  const passStats = extractCategoryStats(statsJson, 'passing');
  if (passStats && statVal(passStats, 'passingYards') > 0) return buildQBProps(statsJson, espnId);
  if (
    recStats &&
    rushStats &&
    statVal(rushStats, 'rushingYards') > statVal(recStats, 'receivingYards')
  )
    return buildRBProps(statsJson, espnId);
  if (recStats && statVal(recStats, 'receivingYards') > 0) return buildWRTEProps(statsJson, espnId, false);
  if (rushStats && statVal(rushStats, 'rushingYards') > 0) return buildRBProps(statsJson, espnId);
  return [];
}

// ─── ESPN data fetch + PropPlayer assembly ───────────────────────────────────

function espnHeadshotUrl(espnId) {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;
}

function fallbackPropPlayer(espnId, positionHint, displayNameHint, teamAbbrHint) {
  const mock = MOCK_BY_ID[espnId];
  if (!mock) return null;
  const teamAbbr = mock.teamAbbr || teamAbbrHint || '—';
  return {
    espnId,
    displayName: mock.displayName || displayNameHint || `Player ${espnId}`,
    position:    mock.position    || positionHint    || '—',
    teamAbbr,
    headshotUrl: espnHeadshotUrl(espnId),
    teamColor:   TEAM_COLORS[teamAbbr] || '#1a1a2e',
    props:       mock.props,
  };
}

async function buildPropPlayer(espnId, positionHint, displayNameHint, teamAbbrHint) {
  const id = String(espnId);

  let statsJson;

  try {
    statsJson = await fetchJson(espnStatsUrl(id));
  } catch {
    return fallbackPropPlayer(id, positionHint, displayNameHint, teamAbbrHint);
  }

  const athleteInfo = statsJson?.athlete || {};
  const displayName = athleteInfo.displayName ?? displayNameHint ?? `Player ${id}`;
  const position = athleteInfo.position?.abbreviation ?? positionHint ?? '—';

  const teamsMap = statsJson?.teams || {};
  const teamAbbr = pickActiveTeamAbbr(teamsMap, teamAbbrHint);

  const props = buildPropsForPosition(statsJson, position, id);

  if (!props.length) {
    const fallback = fallbackPropPlayer(id, positionHint, displayNameHint, teamAbbrHint);
    if (fallback) return fallback;
  }

  return {
    espnId: id,
    displayName,
    position,
    teamAbbr,
    headshotUrl: espnHeadshotUrl(id),
    teamColor: TEAM_COLORS[teamAbbr] || TEAM_COLORS[teamAbbrHint] || '#1a1a2e',
    props,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Loads prop cards for a Props page tab. Re-call on each tab change for fresh
 * leaderboard ranks and per-player stat lines.
 *
 * @param {string} tabLabel UI tab: 'Featured' | 'QB Props' | 'WR Props' | 'RB Props' | 'Best Value'
 */
export async function getPropsForTab(tabLabel) {
  const season = await resolveSeasonYear();
  let hints = [];

  if (tabLabel === 'Featured') {
    hints = await getFeaturedHints(season, PROPS_TAB_LIMIT);
  } else if (tabLabel === 'QB Props') {
    hints = await getPositionHintsFromBoard(
      season,
      'offense:passing',
      'passing.passingYards:desc',
      (pos) => pos === 'QB',
      PROPS_TAB_LIMIT
    );
  } else if (tabLabel === 'WR Props') {
    hints = await getPositionHintsFromBoard(
      season,
      'offense:receiving',
      'receiving.receivingYards:desc',
      (pos) => pos === 'WR',
      PROPS_TAB_LIMIT
    );
  } else if (tabLabel === 'RB Props') {
    hints = await getPositionHintsFromBoard(
      season,
      'offense:rushing',
      'rushing.rushingYards:desc',
      (pos) => pos === 'RB' || pos === 'FB',
      PROPS_TAB_LIMIT
    );
  } else if (tabLabel === 'Best Value') {
    const ranked = await rankAllByScrimmageYards(season);
    const pool = ranked.slice(0, BEST_VALUE_CANDIDATES).map(({ _score, ...h }) => h);
    const built = await mapPool(pool, 5, (h) =>
      buildPropPlayer(h.espnId, h.position, h.displayName, h.teamAbbr)
    );
    const ok = built.filter((p) => p && Array.isArray(p.props) && p.props.length > 0);
    ok.sort((a, b) => valueScoreForPlayer(b) - valueScoreForPlayer(a));
    return ok.slice(0, PROPS_TAB_LIMIT);
  } else {
    hints = await getFeaturedHints(season, PROPS_TAB_LIMIT);
  }

  const built = await mapPool(hints, 5, (h) =>
    buildPropPlayer(h.espnId, h.position, h.displayName, h.teamAbbr)
  );
  return built.filter((p) => p != null);
}

/** @deprecated Prefer getPropsForTab('Featured') */
export async function getFeaturedProps() {
  return getPropsForTab('Featured');
}

/**
 * Searches the NFL player index for `query`, then fetches their 2024 props.
 * Returns a PropPlayer or null if not found.
 */
export async function searchPlayerProps(query) {
  if (!query?.trim()) return null;

  const { players } = await ensureNflPlayerIndex();
  const matches = searchPlayerIndex(players, query.trim(), 5);
  if (!matches.length) return null;

  const best = matches[0];
  return buildPropPlayer(best.espnId, best.positionAbbr, best.displayName, best.teamAbbr);
}
