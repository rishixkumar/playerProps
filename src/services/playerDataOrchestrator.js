import { SPORTSDB_API_KEY } from './config';
import { buildStatViewsForPlayer } from './espnStatCategories';
import { espnSiteUrl } from './espnEndpoints';
import { fetchJson } from './http';

const ESPN_CORE_ATHLETE = (id) =>
  `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${id}`;
const ESPN_OVERVIEW = (id) =>
  espnSiteUrl(`/apis/common/v3/sports/football/nfl/athletes/${id}/overview`);
const ESPN_STATS = (id) =>
  `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${id}/stats`;
const ESPN_GAMELOG = (id) =>
  `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${id}/gamelog`;
const ESPN_SPLITS = (id) =>
  `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${id}/splits`;

export { buildStatViewsForPlayer } from './espnStatCategories';

export function parseGamelogForTable(gamelogJson) {
  const ev = gamelogJson?.events;
  if (!ev || typeof ev !== 'object') return [];
  const rows = Object.values(ev).map((e) => {
    const opp = e.opponent?.abbreviation || '—';
    const wl = e.gameResult || '—';
    const score = e.score || `${e.awayTeamScore || ''}-${e.homeTeamScore || ''}`;
    return {
      week: e.week,
      opp,
      result: `${wl} ${score}`.trim(),
      cmp: '—',
      att: '—',
      yds: '—',
      td: '—',
      int: '—',
      gameDate: e.gameDate,
    };
  });
  rows.sort((a, b) => (a.gameDate || '').localeCompare(b.gameDate || ''));
  return rows.map(({ week, opp, result, cmp, att, yds, td, int }) => ({
    week,
    opp,
    result,
    cmp,
    att,
    yds,
    td,
    int,
  }));
}

export async function fetchEspnAthleteBundle(espnId) {
  const id = String(espnId);
  const [athlete, overview, stats, gamelog, splits] = await Promise.all([
    fetchJson(ESPN_CORE_ATHLETE(id)),
    fetchJson(ESPN_OVERVIEW(id)),
    fetchJson(ESPN_STATS(id)),
    fetchJson(ESPN_GAMELOG(id)),
    fetchJson(ESPN_SPLITS(id)).catch(() => null),
  ]);

  const games = parseGamelogForTable(gamelog);
  const newsHeadline = overview?.news?.[0]?.headline || null;

  return {
    athlete,
    overview,
    stats,
    gamelog,
    splits,
    games,
    newsHeadline,
  };
}

export async function fetchSportsDbBioForEspnPlayer(displayName, espnId) {
  const q = encodeURIComponent(displayName);
  const url = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}/searchplayers.php?p=${q}`;
  try {
    const data = await fetchJson(url);
    const players = data?.player;
    const list = Array.isArray(players) ? players : players ? [players] : [];
    const match =
      list.find((p) => String(p.idESPN) === String(espnId)) ||
      list.find((p) => /football/i.test(p.strSport || '')) ||
      list[0];
    if (!match?.idPlayer) return null;
    const detail = await fetchJson(
      `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}/lookupplayer.php?id=${match.idPlayer}`
    );
    const full = detail?.players?.[0] || match;
    return {
      idPlayer: full.idPlayer,
      description: full.strDescriptionEN || null,
      thumb: full.strCutout || full.strThumb || null,
      birthLocation: full.strBirthLocation || null,
    };
  } catch {
    return null;
  }
}

export async function loadLivePlayerViewModel(espnId) {
  const bundle = await fetchEspnAthleteBundle(espnId);
  const a = bundle.athlete;
  const sportsdb = await fetchSportsDbBioForEspnPlayer(a.displayName, espnId);

  const pos = a.position?.abbreviation || '—';
  const teamAbbr =
    bundle.stats?.teams && Object.values(bundle.stats.teams)[0]?.abbreviation
      ? Object.values(bundle.stats.teams)[0].abbreviation
      : '—';

  const profile = {
    displayName: a.displayName,
    shortName: a.shortName,
    age: a.age,
    teamAbbr,
    teamName: bundle.stats?.teams
      ? Object.values(bundle.stats.teams)[0]?.displayName || `${teamAbbr}`
      : teamAbbr,
    position: pos,
    jersey: String(a.jersey ?? '—'),
    status: 'Active',
    statusDetail: bundle.newsHeadline || '',
    headshotHref: a.headshot?.href || null,
    birthPlace: a.birthPlace
      ? [a.birthPlace.city, a.birthPlace.state, a.birthPlace.country].filter(Boolean).join(', ')
      : null,
    collegeHref: a.college?.$ref || null,
  };

  const { order, defaultKey, views } = buildStatViewsForPlayer(
    bundle.stats,
    bundle.splits,
    pos
  );
  const primary =
    (defaultKey && views[defaultKey]) || (order.length ? views[order[0]] : null) || null;

  return {
    id: `espn-${espnId}`,
    espnId: String(espnId),
    profile,
    statCategoryOrder: order,
    defaultStatCategory: defaultKey,
    statViews: views,
    highlights: primary?.highlights ?? [],
    comparison: primary?.comparison ?? [],
    seasons: primary?.seasons ?? [],
    seasonRecap: primary?.seasonRecap ?? null,
    matchupGrid: primary?.matchupGrid ?? { columns: [], rows: [], footnote: null },
    games: bundle.games,
    newsHeadline: bundle.newsHeadline,
    sportsdb,
  };
}
