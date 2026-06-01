/**
 * Mock NFL player (QB) — replace with API/scrape later.
 */

export const MOCK_PLAYERS = [
  { id: 'demo-qb', name: 'Patrick Mahomes', team: 'KC', position: 'QB' },
  { id: 'demo-qb-2', name: 'Josh Allen', team: 'BUF', position: 'QB' },
  { id: 'demo-rb', name: 'Christian McCaffrey', team: 'SF', position: 'RB' },
];

export const mockPlayerById = {
  'demo-qb': {
    id: 'demo-qb',
    profile: {
      displayName: 'Patrick Mahomes',
      shortName: 'P. Mahomes',
      age: 29,
      teamAbbr: 'KC',
      teamName: 'Kansas City Chiefs',
      position: 'QB',
      jersey: 15,
      status: 'Active',
      statusDetail: 'Probable — ankle',
    },
    highlights: [
      { label: 'Pass Yds', value: '3,928', sub: '2024 reg' },
      { label: 'Pass TD', value: '26', sub: '2024 reg' },
      { label: 'INT', value: '11', sub: '2024 reg' },
      { label: 'Passer rating', value: '98.1', sub: '2024 reg' },
      { label: 'ANY/A', value: '7.42', sub: '2024 reg' },
    ],
    comparison: [
      { key: 'rating', label: 'Passer rating', player: 98.1, leagueAvg: 88.4 },
      { key: 'tdPct', label: 'TD%', player: 5.8, leagueAvg: 4.2 },
      { key: 'intPct', label: 'INT%', player: 2.4, leagueAvg: 2.1 },
      { key: 'ypa', label: 'Yards/att', player: 7.1, leagueAvg: 6.7 },
    ],
    seasons: [
      {
        year: 2022,
        gp: 17,
        cmp: 435,
        att: 648,
        yds: 5250,
        td: 41,
        int: 12,
        rating: 105.2,
        trend: [72, 88, 65, 91, 85, 90, 78, 94],
      },
      {
        year: 2023,
        gp: 16,
        cmp: 401,
        att: 597,
        yds: 4183,
        td: 31,
        int: 14,
        rating: 92.6,
        trend: [70, 75, 82, 68, 88, 79, 91, 86],
      },
      {
        year: 2024,
        gp: 16,
        cmp: 392,
        att: 581,
        yds: 3928,
        td: 26,
        int: 11,
        rating: 98.1,
        trend: [68, 72, 80, 77, 85, 82, 88, 90],
      },
    ],
    games: [
      { week: 1, opp: 'BAL', result: 'W 27-20', cmp: 20, att: 34, yds: 291, td: 1, int: 0 },
      { week: 2, opp: 'CIN', result: 'W 25-17', cmp: 22, att: 35, yds: 286, td: 2, int: 1 },
      { week: 3, opp: 'ATL', result: 'W 22-17', cmp: 26, att: 39, yds: 217, td: 2, int: 0 },
    ],
    matchups: [
      { opp: 'DEN', games: 2, yds: 512, td: 4, int: 1, rating: 101.2 },
      { opp: 'LAC', games: 2, yds: 478, td: 3, int: 2, rating: 94.5 },
    ],
  },
  'demo-qb-2': null,
  'demo-rb': null,
};

/** Default demo id when visiting /player/:id with unknown id */
export const DEFAULT_PLAYER_ID = 'demo-qb';

export function getMockPlayer(id) {
  const raw = mockPlayerById[id];
  if (raw) return raw;
  return mockPlayerById[DEFAULT_PLAYER_ID];
}
