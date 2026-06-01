// src/services/propsService.js
// Computes expected per-game prop lines from ESPN 2024 season stats.

import { ensureNflPlayerIndex, searchPlayerIndex } from './nflPlayerIndex';
import { fetchJson } from './http';

// site.web.api allows CORS * — direct fetch is fine in the browser
const espnStatsUrl = (id) =>
  `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${id}/stats`;

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_COLORS = {
  KC: '#e31837', BUF: '#00338d', CIN: '#fb4f14', SEA: '#002a5c',
  DAL: '#003594', MIN: '#4f2683', SF: '#aa0000', NE: '#002244',
  PHI: '#004c54', BAL: '#241773', MIA: '#008e97', GB: '#203731',
  DEN: '#fb4f14', LAR: '#003594', TB: '#d50a0a', NO: '#d3bc8d',
};

const SOURCE_NAMES = ['PrizePicks', 'Underdog', 'Sleeper', 'Chalkboard'];

const FEATURED_PLAYERS = [
  { espnId: '3139477', position: 'QB', teamAbbr: 'KC',  displayName: 'Patrick Mahomes'       },
  { espnId: '3918298', position: 'QB', teamAbbr: 'BUF', displayName: 'Josh Allen'             },
  { espnId: '4362628', position: 'WR', teamAbbr: 'CIN', displayName: "Ja'Marr Chase"          },
  { espnId: '4685382', position: 'WR', teamAbbr: 'SEA', displayName: 'Jaxon Smith-Njigba'     },
  { espnId: '4047646', position: 'WR', teamAbbr: 'DAL', displayName: 'CeeDee Lamb'            },
  { espnId: '4035538', position: 'WR', teamAbbr: 'MIN', displayName: 'Justin Jefferson'       },
  { espnId: '4241478', position: 'RB', teamAbbr: 'SF',  displayName: 'Christian McCaffrey'   },
  { espnId: '3915511', position: 'QB', teamAbbr: 'CIN', displayName: 'Joe Burrow'             },
];

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
};

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
 * Extract a map of statName → number for a given category + season year.
 * Returns null if the category or year is absent.
 */
function extractCategoryStats(statsJson, categoryName, year = 2024) {
  const cats = statsJson?.categories;
  if (!Array.isArray(cats)) return null;
  const cat = cats.find((c) => c.name === categoryName);
  if (!cat) return null;

  const names  = cat.names  || [];
  const labels = cat.labels || [];
  const statKeys = names.length === labels.length ? names : labels.map((_, i) => `c${i}`);

  const row = (cat.statistics || []).find((r) => r?.season?.year === year);
  if (!row) return null;

  const stats = row.stats || [];
  const byName = {};
  statKeys.forEach((key, idx) => {
    const raw = stats[idx];
    if (raw == null) { byName[key] = 0; return; }
    const n = parseFloat(String(raw).replace(/,/g, ''));
    byName[key] = Number.isFinite(n) ? n : 0;
  });
  return byName;
}

/** Coalesce-style numeric getter: returns the first non-zero value found. */
function num(obj, ...keys) {
  if (!obj) return 0;
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== 0) return v;
  }
  return 0;
}

function getGamesPlayed(statsJson, year = 2024) {
  for (const cat of ['passing', 'rushing', 'receiving', 'miscellaneous', 'scoring', 'defensive']) {
    const s = extractCategoryStats(statsJson, cat, year);
    const gp = num(s, 'gamesPlayed', 'GP');
    if (gp > 0) return gp;
  }
  return 17; // full-season fallback
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
    const passYdsProp = makePropLine('Passing Yards', num(passing, 'passingYards'), gp, 'YDS', espnId, 2.5);
    if (passYdsProp) props.push(passYdsProp);

    const passTdsProp = makePropLine('Pass TDs', num(passing, 'passingTouchdowns'), gp, 'TDS', espnId, 0.5);
    if (passTdsProp) props.push(passTdsProp);

    const compsProp = makePropLine('Completions', num(passing, 'completions'), gp, 'CMP', espnId, 0.5);
    if (compsProp) props.push(compsProp);

    const intsProp = makePropLine('Interceptions', num(passing, 'interceptions'), gp, 'INT', espnId, 0.5);
    if (intsProp) props.push(intsProp);
  }

  if (rushing) {
    const rushAvg = num(rushing, 'rushingYards') / (gp || 1);
    if (rushAvg > 15) {
      const rushProp = makePropLine('Rush Yards', num(rushing, 'rushingYards'), gp, 'YDS', espnId, 0.5);
      if (rushProp) props.push(rushProp);
    }
    const rushTdAvg = num(rushing, 'rushingTouchdowns') / (gp || 1);
    if (rushTdAvg >= 0.35) props.push(makeAnytimeTD(rushTdAvg, espnId));
  }

  return props;
}

function buildWRTEProps(statsJson, espnId, isTE) {
  const gp       = getGamesPlayed(statsJson);
  const receiving = extractCategoryStats(statsJson, 'receiving');
  const props    = [];

  if (receiving) {
    const recYdsProp = makePropLine('Receiving Yards', num(receiving, 'receivingYards'), gp, 'YDS', espnId, 0.5);
    if (recYdsProp) props.push(recYdsProp);

    const recsProp = makePropLine('Receptions', num(receiving, 'receptions'), gp, 'REC', espnId, 0.5);
    if (recsProp) props.push(recsProp);

    const tdsProp = makePropLine('Touchdowns', num(receiving, 'receivingTouchdowns'), gp, 'TDS', espnId, 0.5);
    if (tdsProp) props.push(tdsProp);

    if (isTE) {
      const tgtsProp = makePropLine('Targets', num(receiving, 'receivingTargets'), gp, 'TGT', espnId, 0.5);
      if (tgtsProp) props.push(tgtsProp);
    }

    const recTdAvg = num(receiving, 'receivingTouchdowns') / (gp || 1);
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
    const rushProp = makePropLine('Rush Yards', num(rushing, 'rushingYards'), gp, 'YDS', espnId, 0.5);
    if (rushProp) props.push(rushProp);

    const rushTdsProp = makePropLine('Rush TDs', num(rushing, 'rushingTouchdowns'), gp, 'TDS', espnId, 0.5);
    if (rushTdsProp) props.push(rushTdsProp);
  }

  if (receiving) {
    const recsProp = makePropLine('Receptions', num(receiving, 'receptions'), gp, 'REC', espnId, 0.5);
    if (recsProp) props.push(recsProp);

    const recYdsAvg = num(receiving, 'receivingYards') / (gp || 1);
    if (recYdsAvg > 15) {
      const recYdsProp = makePropLine('Receiving Yards', num(receiving, 'receivingYards'), gp, 'YDS', espnId, 0.5);
      if (recYdsProp) props.push(recYdsProp);
    }
  }

  const rushTds = rushing  ? num(rushing,   'rushingTouchdowns')   / (gp || 1) : 0;
  const recTds  = receiving ? num(receiving, 'receivingTouchdowns') / (gp || 1) : 0;
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
  if (passStats && num(passStats, 'passingYards') > 0) return buildQBProps(statsJson, espnId);
  if (recStats  && rushStats && num(rushStats, 'rushingYards') > num(recStats, 'receivingYards'))
    return buildRBProps(statsJson, espnId);
  if (recStats  && num(recStats, 'receivingYards') > 0) return buildWRTEProps(statsJson, espnId, false);
  if (rushStats && num(rushStats, 'rushingYards') > 0) return buildRBProps(statsJson, espnId);
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

  // Pull metadata from the stats response
  const athleteInfo = statsJson?.athlete || {};
  const displayName = athleteInfo.displayName || displayNameHint || `Player ${id}`;
  const position    = athleteInfo.position?.abbreviation || positionHint || '—';

  const teamsMap = statsJson?.teams || {};
  const firstTeam = Object.values(teamsMap)[0];
  const teamAbbr  = firstTeam?.abbreviation || teamAbbrHint || '—';

  const props = buildPropsForPosition(statsJson, position, id);

  // Fall back to mock if no props could be extracted (e.g. off-season no stats)
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
    teamColor:   TEAM_COLORS[teamAbbr] || TEAM_COLORS[teamAbbrHint] || '#1a1a2e',
    props,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns PropPlayer objects for the 8 featured players.
 * Uses Promise.allSettled so individual failures don't block the rest.
 */
export async function getFeaturedProps() {
  const results = await Promise.allSettled(
    FEATURED_PLAYERS.map(({ espnId, position, teamAbbr, displayName }) =>
      buildPropPlayer(espnId, position, displayName, teamAbbr)
    )
  );

  return results
    .filter((r) => r.status === 'fulfilled' && r.value != null)
    .map((r) => r.value);
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
