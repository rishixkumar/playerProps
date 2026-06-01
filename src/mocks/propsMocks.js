/**
 * Offline / API-failure fallbacks for the Props experience.
 * Single source for per-player stub lines; tab cards are built via helpers below.
 */

import { NFL_TEAM_COLORS } from '../constants/nflTeamColors';

/** Stub prop lines keyed by ESPN athlete id (used by propsService fallback + tab demos). */
export const MOCK_PROP_PLAYER_BY_ID = {
  '3139477': {
    displayName: 'Patrick Mahomes',
    position: 'QB',
    teamAbbr: 'KC',
    props: [
      {
        statLabel: 'Passing Yards',
        line: 274.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 274.5 },
          { name: 'Underdog', line: 271.5 },
          { name: 'Sleeper', line: 276 },
        ],
        projection: 281.2,
      },
      {
        statLabel: 'Pass TDs',
        line: 2.5,
        unit: 'TDS',
        overOdds: '-130',
        underOdds: '+110',
        sources: [
          { name: 'PrizePicks', line: 2.5 },
          { name: 'Underdog', line: 2.5 },
          { name: 'Sleeper', line: 2.5 },
        ],
        projection: 2.7,
      },
      {
        statLabel: 'Completions',
        line: 24.5,
        unit: 'CMP',
        overOdds: '-115',
        underOdds: '-115',
        sources: [{ name: 'PrizePicks', line: 24.5 }],
        projection: 25.8,
      },
    ],
  },
  '3918298': {
    displayName: 'Josh Allen',
    position: 'QB',
    teamAbbr: 'BUF',
    props: [
      {
        statLabel: 'Passing Yards',
        line: 254.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 254.5 },
          { name: 'Underdog', line: 252.0 },
          { name: 'Sleeper', line: 256.5 },
        ],
        projection: 260.3,
      },
      {
        statLabel: 'Pass TDs',
        line: 2.5,
        unit: 'TDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 2.5 },
          { name: 'Underdog', line: 2.5 },
          { name: 'Sleeper', line: 2.5 },
        ],
        projection: 2.6,
      },
      {
        statLabel: 'Rush Yards',
        line: 34.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 34.5 },
          { name: 'Underdog', line: 33.5 },
          { name: 'Sleeper', line: 35.5 },
        ],
        projection: 36.2,
      },
    ],
  },
  '4362628': {
    displayName: "Ja'Marr Chase",
    position: 'WR',
    teamAbbr: 'CIN',
    props: [
      {
        statLabel: 'Receiving Yards',
        line: 88.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 88.5 },
          { name: 'Underdog', line: 87 },
          { name: 'Sleeper', line: 90 },
        ],
        projection: 96.3,
      },
      {
        statLabel: 'Receptions',
        line: 6.5,
        unit: 'REC',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 6.5 },
          { name: 'Underdog', line: 6 },
          { name: 'Sleeper', line: 7 },
        ],
        projection: 6.9,
      },
      {
        statLabel: 'Touchdowns',
        line: 0.5,
        unit: 'TDS',
        overOdds: '+130',
        underOdds: '-160',
        sources: [
          { name: 'PrizePicks', line: 0.5 },
          { name: 'Sleeper', line: 0.5 },
        ],
        projection: 0.71,
      },
    ],
  },
  '4430878': {
    displayName: 'Jaxon Smith-Njigba',
    position: 'WR',
    teamAbbr: 'SEA',
    props: [
      {
        statLabel: 'Receiving Yards',
        line: 72.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 72.5 },
          { name: 'Underdog', line: 71.5 },
          { name: 'Sleeper', line: 73 },
        ],
        projection: 79.1,
      },
      {
        statLabel: 'Receptions',
        line: 5.5,
        unit: 'REC',
        overOdds: '-120',
        underOdds: '+100',
        sources: [
          { name: 'PrizePicks', line: 5.5 },
          { name: 'Underdog', line: 5 },
          { name: 'Sleeper', line: 6 },
        ],
        projection: 5.8,
      },
      {
        statLabel: 'Touchdowns',
        line: 0.5,
        unit: 'TDS',
        overOdds: '+140',
        underOdds: '-180',
        sources: [
          { name: 'PrizePicks', line: 0.5 },
          { name: 'Sleeper', line: 0.5 },
        ],
        projection: 0.52,
      },
    ],
  },
  '4241389': {
    displayName: 'CeeDee Lamb',
    position: 'WR',
    teamAbbr: 'DAL',
    props: [
      {
        statLabel: 'Receiving Yards',
        line: 81.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 81.5 },
          { name: 'Underdog', line: 80 },
          { name: 'Sleeper', line: 82 },
        ],
        projection: 85.2,
      },
      {
        statLabel: 'Receptions',
        line: 7.5,
        unit: 'REC',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 7.5 },
          { name: 'Underdog', line: 7 },
          { name: 'Sleeper', line: 7.5 },
        ],
        projection: 7.1,
      },
    ],
  },
  '4262921': {
    displayName: 'Justin Jefferson',
    position: 'WR',
    teamAbbr: 'MIN',
    props: [
      {
        statLabel: 'Receiving Yards',
        line: 84.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 84.5 },
          { name: 'Underdog', line: 84 },
          { name: 'Sleeper', line: 85 },
        ],
        projection: 88.7,
      },
      {
        statLabel: 'Receptions',
        line: 6.5,
        unit: 'REC',
        overOdds: '-110',
        underOdds: '-120',
        sources: [
          { name: 'PrizePicks', line: 6.5 },
          { name: 'Sleeper', line: 6 },
        ],
        projection: 6.2,
      },
    ],
  },
  '3117251': {
    displayName: 'Christian McCaffrey',
    position: 'RB',
    teamAbbr: 'SF',
    props: [
      {
        statLabel: 'Rush Yards',
        line: 68.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 68.5 },
          { name: 'Underdog', line: 67 },
          { name: 'Sleeper', line: 69 },
        ],
        projection: 72.4,
      },
      {
        statLabel: 'Receptions',
        line: 5.5,
        unit: 'REC',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 5.5 },
          { name: 'Underdog', line: 5 },
          { name: 'Sleeper', line: 6 },
        ],
        projection: 5.2,
      },
      {
        statLabel: 'Rush TDs',
        line: 0.5,
        unit: 'TDS',
        overOdds: '+120',
        underOdds: '-150',
        sources: [
          { name: 'PrizePicks', line: 0.5 },
          { name: 'Sleeper', line: 0.5 },
        ],
        projection: 0.6,
      },
    ],
  },
  '3915511': {
    displayName: 'Joe Burrow',
    position: 'QB',
    teamAbbr: 'CIN',
    props: [
      {
        statLabel: 'Passing Yards',
        line: 268.5,
        unit: 'YDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 268.5 },
          { name: 'Underdog', line: 267 },
          { name: 'Sleeper', line: 270 },
        ],
        projection: 275.1,
      },
      {
        statLabel: 'Pass TDs',
        line: 2.5,
        unit: 'TDS',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 2.5 },
          { name: 'Underdog', line: 2.5 },
          { name: 'Sleeper', line: 2.5 },
        ],
        projection: 2.4,
      },
      {
        statLabel: 'Completions',
        line: 25.5,
        unit: 'CMP',
        overOdds: '-115',
        underOdds: '-115',
        sources: [
          { name: 'PrizePicks', line: 25.5 },
          { name: 'Sleeper', line: 25 },
        ],
        projection: 26.2,
      },
    ],
  },
};

/** Default order when showing a short fallback strip on the Props grid */
export const FALLBACK_TAB_PLAYER_ORDER = [
  '4430878',
  '3139477',
  '4362628',
  '3918298',
  '4241389',
  '4262921',
  '3117251',
  '3915511',
];

function espnHeadshotUrl(espnId) {
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;
}

/** Full prop card shape for UI (matches buildPropPlayer output). */
export function buildFallbackPropCard(espnId) {
  const id = String(espnId);
  const stub = MOCK_PROP_PLAYER_BY_ID[id];
  if (!stub) return null;
  const teamAbbr = stub.teamAbbr || '—';
  return {
    espnId: id,
    displayName: stub.displayName,
    position: stub.position,
    teamAbbr,
    headshotUrl: espnHeadshotUrl(id),
    teamColor: NFL_TEAM_COLORS[teamAbbr] || '#1a1a2e',
    props: stub.props,
  };
}

/**
 * @param {number} [maxCount]
 */
export function getFallbackTabPlayers(maxCount = 6) {
  const n = Math.min(maxCount, FALLBACK_TAB_PLAYER_ORDER.length);
  return FALLBACK_TAB_PLAYER_ORDER.slice(0, n).map((id) => buildFallbackPropCard(id)).filter(Boolean);
}

/** Case-insensitive partial name match against mock roster (for search fallback). */
export function findFallbackPropPlayerByNameQuery(query) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return null;
  for (const id of FALLBACK_TAB_PLAYER_ORDER) {
    const stub = MOCK_PROP_PLAYER_BY_ID[id];
    if (stub?.displayName && stub.displayName.toLowerCase().includes(q)) {
      return buildFallbackPropCard(id);
    }
  }
  return null;
}
