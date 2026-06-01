import { INDEX_CACHE_KEY, INDEX_TTL_MS, ROSTER_FETCH_CONCURRENCY } from './config';
import { espnSiteUrl } from './espnEndpoints';
import { fetchJson } from './http';

const TEAMS_URL = espnSiteUrl('/apis/site/v2/sports/football/nfl/teams?limit=64');

function rosterUrl(teamId) {
  return espnSiteUrl(`/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`);
}

function flattenRoster(athleteGroups) {
  if (!Array.isArray(athleteGroups)) return [];
  return athleteGroups.flatMap((g) => g.items || []);
}

async function mapPool(items, limit, mapper) {
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

function normalizePlayer(raw, teamAbbr, teamId) {
  const headshotHref = raw.headshot?.href || null;
  return {
    espnId: String(raw.id),
    displayName: raw.displayName || `${raw.firstName || ''} ${raw.lastName || ''}`.trim(),
    firstName: raw.firstName,
    lastName: raw.lastName,
    positionAbbr: raw.position?.abbreviation || raw.position?.type || '—',
    teamAbbr: teamAbbr || '—',
    teamId: String(teamId),
    headshotHref,
    /** Route segment */
    routeId: `espn-${raw.id}`,
  };
}

export async function buildNflPlayerIndexFromEspn() {
  const teamsPayload = await fetchJson(TEAMS_URL);
  const teams = teamsPayload?.sports?.[0]?.leagues?.[0]?.teams || [];
  const teamRows = teams
    .map((t) => t.team)
    .filter(Boolean)
    .map((team) => ({
      id: team.id,
      abbr: team.abbreviation,
    }));

  const rosterChunks = await mapPool(teamRows, ROSTER_FETCH_CONCURRENCY, async (team) => {
    try {
      const roster = await fetchJson(rosterUrl(team.id));
      const flat = flattenRoster(roster.athletes);
      return flat.map((a) => normalizePlayer(a, team.abbr, team.id));
    } catch {
      return [];
    }
  });

  const merged = rosterChunks.flat();
  merged.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return merged;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(INDEX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.t || !Array.isArray(parsed.players)) return null;
    if (Date.now() - parsed.t > INDEX_TTL_MS) return null;
    return parsed.players;
  } catch {
    return null;
  }
}

function writeCache(players) {
  try {
    sessionStorage.setItem(
      INDEX_CACHE_KEY,
      JSON.stringify({ t: Date.now(), players })
    );
  } catch {
    /* quota — ignore */
  }
}

let inflightBuild = null;

/**
 * Ensures an in-memory + sessionStorage roster index exists (ESPN only).
 * @returns {Promise<{ players: ReturnType<typeof normalizePlayer>[], fromCache: boolean }>}
 */
export function ensureNflPlayerIndex() {
  if (inflightBuild) return inflightBuild;
  const cached = readCache();
  if (cached?.length) {
    return Promise.resolve({ players: cached, fromCache: true });
  }
  inflightBuild = (async () => {
    const players = await buildNflPlayerIndexFromEspn();
    writeCache(players);
    return { players, fromCache: false };
  })().finally(() => {
    inflightBuild = null;
  });
  return inflightBuild;
}

export function searchPlayerIndex(players, query, limit = 12) {
  const q = query.trim().toLowerCase();
  if (!q) return players.slice(0, limit);
  const scored = [];
  for (const p of players) {
    const name = (p.displayName || '').toLowerCase();
    const team = (p.teamAbbr || '').toLowerCase();
    const pos = (p.positionAbbr || '').toLowerCase();
    if (!name.includes(q) && !team.includes(q) && !pos.includes(q)) continue;
    let score = 0;
    if (name.startsWith(q)) score += 100;
    if (name.includes(q)) score += 50 + (name.indexOf(q) === 0 ? 20 : 0);
    if (team === q) score += 40;
    if (team.includes(q)) score += 10;
    scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score || a.p.displayName.localeCompare(b.p.displayName));
  return scored.slice(0, limit).map((x) => x.p);
}
