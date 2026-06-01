/** Demo Patreon key — set REACT_APP_SPORTSDB_API_KEY for production. */
export const SPORTSDB_API_KEY =
  typeof process !== 'undefined' && process.env.REACT_APP_SPORTSDB_API_KEY
    ? process.env.REACT_APP_SPORTSDB_API_KEY
    : '3';

export const INDEX_CACHE_KEY = 'pp_nfl_roster_index_v1';
/** Refresh roster index after this many ms (24h). */
export const INDEX_TTL_MS = 24 * 60 * 60 * 1000;
/** Max concurrent roster fetches when building the index. */
export const ROSTER_FETCH_CONCURRENCY = 6;
