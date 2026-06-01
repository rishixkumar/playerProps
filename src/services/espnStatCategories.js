/**
 * ESPN athlete stats JSON uses `categories[].name` (e.g. passing, receiving, defensive).
 * This module picks sensible defaults by position and builds per-category view payloads.
 */

/** Preferred tab order in the UI (subset may exist per player). */
export const STAT_CATEGORY_UI_ORDER = [
  'passing',
  'rushing',
  'receiving',
  'defensive',
  'returning',
  'kicking',
  'punting',
  'scoring',
  'fumbles',
  'miscellaneous',
];

export function findStatsCategory(statsJson, categoryName) {
  const cats = statsJson?.categories || [];
  return cats.find((c) => c.name === categoryName) || null;
}

/** Category names that have at least one season row with a year. */
export function listStatCategoryNames(statsJson) {
  const cats = statsJson?.categories || [];
  const names = [];
  for (const c of cats) {
    if (!c?.name || !Array.isArray(c.statistics)) continue;
    const hasSeason = c.statistics.some((r) => r?.season?.year != null);
    if (hasSeason) names.push(c.name);
  }
  return names;
}

export function orderCategoryNames(names) {
  const set = new Set(names);
  const ordered = [];
  for (const n of STAT_CATEGORY_UI_ORDER) {
    if (set.has(n)) ordered.push(n);
  }
  for (const n of names) {
    if (!ordered.includes(n)) ordered.push(n);
  }
  return ordered;
}

function pickFirstAvailable(preferred, availableSet) {
  for (const p of preferred) {
    if (availableSet.has(p)) return p;
  }
  return null;
}

/**
 * Choose default stat tab from roster position and which categories ESPN returned.
 */
export function defaultStatCategoryForPosition(positionAbbr, availableNames) {
  const avail = new Set(availableNames);
  if (!avail.size) return null;
  const pos = String(positionAbbr || '')
    .toUpperCase()
    .trim();

  const tryPos = (candidates) => pickFirstAvailable(candidates, avail);

  if (pos === 'QB') return tryPos(['passing', 'rushing', 'receiving']) || [...avail][0];
  if (pos === 'RB' || pos === 'FB') return tryPos(['rushing', 'receiving', 'passing']) || [...avail][0];
  if (pos === 'WR' || pos === 'TE') return tryPos(['receiving', 'rushing', 'passing', 'returning']) || [...avail][0];
  if (pos === 'K') return tryPos(['kicking', 'scoring', 'passing']) || [...avail][0];
  if (pos === 'P') return tryPos(['punting', 'passing']) || [...avail][0];

  const defenseLike =
    /^(DE|DT|NT|DL|LB|ILB|OLB|MLB|DB|CB|FS|SS|S|SAF|D|NCB|LCB|RCB)$/.test(pos) ||
    pos.includes('LB') ||
    pos.includes('DB') ||
    pos.includes('SAF');
  if (defenseLike) return tryPos(['defensive', 'passing', 'rushing']) || [...avail][0];

  if (pos === 'OL' || pos === 'C' || pos === 'G' || pos === 'T' || pos === 'OT' || pos === 'OG')
    return tryPos(['passing', 'rushing', 'miscellaneous']) || [...avail][0];

  return tryPos(['receiving', 'rushing', 'passing', 'defensive']) || [...avail][0];
}

export function formatStatCategoryTitle(name) {
  if (!name) return 'Stats';
  const map = {
    passing: 'Passing',
    rushing: 'Rushing',
    receiving: 'Receiving',
    defensive: 'Defense',
    returning: 'Returns',
    kicking: 'Kicking',
    punting: 'Punting',
    scoring: 'Scoring',
    fumbles: 'Fumbles',
    miscellaneous: 'Miscellaneous',
  };
  if (map[name]) return map[name];
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function syntheticTrendFromNumber(seed) {
  const base = Math.max(40, Math.min(120, seed / 50));
  return Array.from({ length: 8 }, (_, i) =>
    Math.round(base + 12 * Math.sin(i / 1.7) + (i % 3) * 4)
  );
}

function rowToByName(row, labels, names) {
  const statKeys = names?.length === labels?.length ? names : labels.map((_, i) => `c${i}`);
  const stats = row?.stats || [];
  const byName = {};
  statKeys.forEach((key, i) => {
    byName[key] = stats[i];
  });
  return { byName, statKeys };
}

function numFrom(byName, key) {
  const raw = byName[key];
  if (raw == null) return 0;
  const n = parseFloat(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function trendAnchorForCategory(categoryName, byName) {
  const n = (k) => numFrom(byName, k);
  if (categoryName === 'defensive')
    return n('totalTackles') * 3 + n('sacks') * 15 + n('interceptions') * 20 + n('passesDefended') * 8;
  if (categoryName === 'kicking') return n('fieldGoalsMade') * 10 + n('extraPointsMade') * 3;
  if (categoryName === 'punting') return n('punts') * 40 + n('puntAverage') * 10;
  if (categoryName === 'scoring') return n('totalPoints') || n('touchdowns') * 6;
  const ydsKeys = ['passingYards', 'rushingYards', 'receivingYards', 'kickReturnYards', 'puntReturnYards', 'yards'];
  for (const k of ydsKeys) {
    if (byName[k] != null) return n(k);
  }
  return n('YDS') || n('TOT') || n('totalTackles') || 1;
}

/**
 * Season recap + compact `seasons` rows for one ESPN category.
 */
export function parseSeasonRecapForCategory(statsJson, categoryName) {
  const cat = findStatsCategory(statsJson, categoryName);
  if (!cat?.labels || !Array.isArray(cat.statistics)) {
    return {
      categoryName,
      labels: [],
      seasons: [],
      recapColumns: [],
      recapRows: [],
    };
  }

  const labels = cat.labels;
  const names = cat.names || [];
  const statKeys = names.length === labels.length ? names : labels.map((_, i) => `c${i}`);

  const seasons = cat.statistics
    .map((row) => {
      const year = row.season?.year;
      if (!year) return null;
      const { byName } = rowToByName(row, labels, names);
      const num = (key) => numFrom(byName, key);
      const ydsKeys = ['passingYards', 'rushingYards', 'receivingYards', 'yards'];
      const ydsKey = ydsKeys.find((k) => byName[k] != null) || statKeys.find((k) => /yard/i.test(k));
      const yds = ydsKey ? num(ydsKey) : num('YDS') || 0;
      const trend = syntheticTrendFromNumber(trendAnchorForCategory(categoryName, byName));
      return {
        year,
        gp: num('gamesPlayed') || num('GP'),
        cmp: num('completions') || num('CMP'),
        att: num('passingAttempts') || num('rushingAttempts') || num('ATT'),
        yds,
        td:
          num('passingTouchdowns') ||
          num('rushingTouchdowns') ||
          num('receivingTouchdowns') ||
          num('TD'),
        int: num('interceptions') || num('INT'),
        rating: num('QBRating') || num('RTG'),
        rec: num('receptions') || num('REC'),
        tgt: num('receivingTargets') || num('TGTS') || num('TGT'),
        trend,
        _byName: byName,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.year - b.year);

  const skip = new Set(['gamesPlayed']);
  const recapColumnDefs = statKeys
    .map((key, i) => ({ key, label: labels[i] || key }))
    .filter((_, i) => !skip.has(statKeys[i]))
    .slice(0, 12);

  const recapRows = seasons.map((s) => ({
    year: s.year,
    trend: s.trend,
    values: recapColumnDefs.map((col) => {
      const raw = s._byName[col.key];
      return raw != null ? String(raw) : '—';
    }),
  }));

  seasons.forEach((s) => {
    delete s._byName;
  });

  return {
    categoryName: cat.name,
    labels,
    seasons,
    recapColumns: recapColumnDefs,
    recapRows,
  };
}

function latestSeasonRow(cat) {
  const rows = (cat?.statistics || []).filter((s) => s?.season?.year != null);
  if (!rows.length) return null;
  return rows.reduce((best, row) => (row.season.year > (best?.season?.year || 0) ? row : best), rows[0]);
}

export function buildHighlightsFromCategory(statsJson, categoryName) {
  const cat = findStatsCategory(statsJson, categoryName);
  const last = latestSeasonRow(cat);
  if (!last) return [];
  const { byName } = rowToByName(last, cat.labels, cat.names || []);
  const n = (key) => numFrom(byName, key);
  const y = last.season.year;

  if (categoryName === 'rushing') {
    const att = n('rushingAttempts') || n('ATT') || n('CAR');
    const yds = n('rushingYards') || n('YDS');
    const td = n('rushingTouchdowns') || n('TD');
    return [
      { label: 'Rush Yds', value: yds.toLocaleString(), sub: `${y} reg` },
      { label: 'Rush TD', value: String(td), sub: `${y} reg` },
      { label: 'Carries', value: String(att), sub: `${y} reg` },
      { label: 'Yards/carry', value: att ? (yds / att).toFixed(2) : '—', sub: `${y} reg` },
    ];
  }

  if (categoryName === 'receiving') {
    const rec = n('receptions') || n('REC');
    const tgt = n('receivingTargets') || n('TGTS') || n('TGT');
    const yds = n('receivingYards') || n('YDS');
    const td = n('receivingTouchdowns') || n('TD');
    return [
      { label: 'Rec Yds', value: yds.toLocaleString(), sub: `${y} reg` },
      { label: 'Rec TD', value: String(td), sub: `${y} reg` },
      { label: 'Rec / Tgt', value: `${rec} / ${tgt}`, sub: `${y} reg` },
      {
        label: 'Catch%',
        value: tgt && rec ? `${((rec / tgt) * 100).toFixed(1)}%` : '—',
        sub: `${y} reg`,
      },
    ];
  }

  if (categoryName === 'passing') {
    const att = n('passingAttempts') || n('ATT');
    const yds = n('passingYards') || n('YDS');
    const td = n('passingTouchdowns') || n('TD');
    const int = n('interceptions') || n('INT');
    const rtg = n('QBRating') || n('RTG');
    const cmp = n('completions') || n('CMP');
    return [
      { label: 'Pass Yds', value: yds.toLocaleString(), sub: `${y} reg` },
      { label: 'Pass TD', value: String(td), sub: `${y} reg` },
      { label: 'INT', value: String(int), sub: `${y} reg` },
      { label: 'Passer rating', value: rtg ? rtg.toFixed(1) : '—', sub: `${y} reg` },
      { label: 'Cmp / Att', value: `${cmp} / ${att}`, sub: `${y} reg` },
    ];
  }

  if (categoryName === 'defensive') {
    const tot = n('totalTackles') || n('TOT');
    const solo = n('soloTackles');
    const sk = n('sacks');
    const ints = n('interceptions');
    const pd = n('passesDefended');
    return [
      { label: 'Tackles', value: String(tot || '—'), sub: `${y} reg` },
      { label: 'Sacks', value: String(sk), sub: `${y} reg` },
      { label: 'INT', value: String(ints), sub: `${y} reg` },
      { label: 'PD', value: String(pd), sub: `${y} reg` },
      ...(solo ? [{ label: 'Solo', value: String(solo), sub: `${y} reg` }] : []),
    ];
  }

  if (categoryName === 'returning') {
    const kry = n('kickReturnYards');
    const krt = n('kickReturnTouchdowns');
    const pry = n('puntReturnYards');
    const prt = n('puntReturnTouchdowns');
    return [
      { label: 'KR Yds', value: String(kry || '—'), sub: `${y} reg` },
      { label: 'KR TD', value: String(krt), sub: `${y} reg` },
      { label: 'PR Yds', value: String(pry || '—'), sub: `${y} reg` },
      { label: 'PR TD', value: String(prt), sub: `${y} reg` },
    ];
  }

  if (categoryName === 'kicking') {
    const fgm = n('fieldGoalsMade');
    const fga = n('fieldGoalAttempts');
    const xpm = n('extraPointsMade');
    const lng = n('longFieldGoalMade');
    return [
      { label: 'FG', value: `${fgm}/${fga}`, sub: `${y} reg` },
      { label: 'XP', value: String(xpm), sub: `${y} reg` },
      { label: 'Long FG', value: lng ? String(lng) : '—', sub: `${y} reg` },
    ];
  }

  if (categoryName === 'punting') {
    const punts = n('punts');
    const avg = n('puntAverage') || n('grossAveragePuntYards');
    const ins20 = n('puntsInside20');
    return [
      { label: 'Punts', value: String(punts), sub: `${y} reg` },
      { label: 'Avg', value: avg ? avg.toFixed(1) : '—', sub: `${y} reg` },
      { label: 'In 20', value: String(ins20 || '—'), sub: `${y} reg` },
    ];
  }

  if (categoryName === 'scoring') {
    const td = n('touchdowns') || n('totalTouchdowns');
    const pts = n('totalPoints');
    return [
      { label: 'TD', value: String(td || '—'), sub: `${y} reg` },
      { label: 'Pts', value: String(pts || '—'), sub: `${y} reg` },
    ];
  }

  /* Generic: first few labeled numeric columns (skip games played). */
  const labels = cat.labels || [];
  const keys = cat.names?.length === labels.length ? cat.names : labels.map((_, i) => `c${i}`);
  const out = [];
  for (let i = 0; i < keys.length && out.length < 5; i++) {
    const key = keys[i];
    if (/gamesplayed/i.test(key)) continue;
    const val = byName[key];
    if (val == null || val === '') continue;
    const num = parseFloat(String(val).replace(/,/g, ''));
    if (!Number.isFinite(num)) continue;
    out.push({ label: labels[i] || key, value: String(val), sub: `${y} reg` });
  }
  return out.length ? out : [{ label: formatStatCategoryTitle(categoryName), value: '—', sub: `${y} reg` }];
}

const LEAGUE_PASS_BASE = {
  rating: 88.4,
  tdPct: 4.2,
  intPct: 2.1,
  ypa: 6.7,
};

export function buildComparisonFromCategory(statsJson, categoryName) {
  const cat = findStatsCategory(statsJson, categoryName);
  if (!cat?.statistics?.length) {
    return [{ key: 'rating', label: 'Passer rating', player: 0, leagueAvg: LEAGUE_PASS_BASE.rating }];
  }

  const rows = cat.statistics.filter((s) => s.season?.year != null);
  const latest = rows.reduce(
    (best, row) => (row.season.year > (best?.season?.year || 0) ? row : best),
    rows[0]
  );
  const labels = cat.labels;
  const stats = latest?.stats || [];
  const gi = (name) => {
    const i = labels.indexOf(name);
    return i >= 0 ? parseFloat(String(stats[i]).replace(/,/g, '')) || 0 : 0;
  };

  if (categoryName === 'passing') {
    const att = gi('ATT');
    const td = gi('TD');
    const int = gi('INT');
    const yds = gi('YDS');
    const rtg = gi('RTG');
    const tdPct = att ? (td / att) * 100 : 0;
    const intPct = att ? (int / att) * 100 : 0;
    const ypa = att ? yds / att : 0;
    return [
      { key: 'rating', label: 'Passer rating', player: rtg, leagueAvg: LEAGUE_PASS_BASE.rating },
      { key: 'tdPct', label: 'TD%', player: Number(tdPct.toFixed(2)), leagueAvg: LEAGUE_PASS_BASE.tdPct },
      { key: 'intPct', label: 'INT%', player: Number(intPct.toFixed(2)), leagueAvg: LEAGUE_PASS_BASE.intPct },
      { key: 'ypa', label: 'Yards/att', player: Number(ypa.toFixed(2)), leagueAvg: LEAGUE_PASS_BASE.ypa },
    ];
  }

  if (categoryName === 'rushing') {
    const att = gi('ATT') || gi('CAR');
    const yds = gi('YDS');
    const td = gi('TD');
    const ypa = att ? yds / att : 0;
    return [
      { key: 'ypc', label: 'Yards/carry', player: Number(ypa.toFixed(2)), leagueAvg: 4.3 },
      { key: 'yds', label: 'Rush yds (season)', player: yds, leagueAvg: 850 },
      { key: 'td', label: 'Rush TD', player: td, leagueAvg: 8 },
    ];
  }

  if (categoryName === 'receiving') {
    const rec = gi('REC');
    const tgt = gi('TGTS') || gi('TGT');
    const yds = gi('YDS');
    const td = gi('TD');
    const catchPct = tgt ? (rec / tgt) * 100 : 0;
    return [
      { key: 'recYds', label: 'Rec yds', player: yds, leagueAvg: 750 },
      { key: 'recTd', label: 'Rec TD', player: td, leagueAvg: 5 },
      { key: 'catchPct', label: 'Catch %', player: Number(catchPct.toFixed(1)), leagueAvg: 65 },
    ];
  }

  if (categoryName === 'defensive') {
    const tot = gi('TOT');
    const sk = gi('SACK');
    const ints = gi('INT');
    const pd = gi('PD');
    return [
      { key: 'tackles', label: 'Tackles', player: tot, leagueAvg: 85 },
      { key: 'sacks', label: 'Sacks', player: sk, leagueAvg: 8 },
      { key: 'ints', label: 'INT', player: ints, leagueAvg: 3 },
      { key: 'pd', label: 'Passes def', player: pd, leagueAvg: 8 },
    ];
  }

  if (categoryName === 'returning') {
    let krYds = 0;
    for (let i = 0; i < labels.length; i++) {
      if (/kick.*ret|kr.*yd|return.*yd/i.test(String(labels[i]))) {
        krYds = parseFloat(String(stats[i]).replace(/,/g, '')) || 0;
        break;
      }
    }
    const yds = krYds || gi('YDS');
    return [
      { key: 'retYds', label: 'Return yds (est.)', player: yds, leagueAvg: 200 },
      { key: 'td', label: 'Return TD', player: gi('TD'), leagueAvg: 0.5 },
    ];
  }

  /* Fallback: reuse rushing-style if YDS/ATT exist */
  const att = gi('ATT') || gi('CAR');
  const yds = gi('YDS');
  const td = gi('TD');
  if (yds || att) {
    const ypa = att ? yds / att : 0;
    return [
      { key: 'yds', label: 'Yards', player: yds, leagueAvg: Math.max(1, yds) },
      { key: 'td', label: 'TD', player: td, leagueAvg: 4 },
      { key: 'ypu', label: 'Yds/unit', player: Number(ypa.toFixed(2)), leagueAvg: 5 },
    ];
  }

  return [{ key: 'placeholder', label: 'Stat value', player: 0, leagueAvg: 1 }];
}

function pickNum(stats, names, n) {
  const i = names.indexOf(n);
  if (i < 0) return 0;
  const raw = stats[i];
  if (raw == null) return 0;
  const v = parseFloat(String(raw).replace(/,/g, ''));
  return Number.isFinite(v) ? v : 0;
}

function firstPositive(stats, names, keyList) {
  for (const k of keyList) {
    const v = pickNum(stats, names, k);
    if (v > 0) return v;
  }
  return 0;
}

/**
 * Opponent splits: map ESPN `names` indices. Columns depend on selected stat category.
 */
export function buildMatchupGridFromSplits(splitsJson, categoryName) {
  const names = splitsJson?.names || [];
  const cat = splitsJson?.splitCategories?.find((s) => s.name === 'byOpponent');
  if (!names.length || !cat?.splits?.length) {
    return { columns: [], rows: [], footnote: null };
  }

  const slotDefs = (() => {
    if (categoryName === 'receiving') {
      return [
        { key: 'a', label: 'Rec Yds', sort: (st) => pickNum(st, names, 'receivingYards') },
        { key: 'b', label: 'Rec', sort: (st) => pickNum(st, names, 'receptions') },
        { key: 'c', label: 'Rec TD', sort: (st) => pickNum(st, names, 'receivingTouchdowns') },
        { key: 'd', label: 'Y/R', sort: (st) => pickNum(st, names, 'yardsPerReception') },
      ];
    }
    if (categoryName === 'rushing') {
      return [
        { key: 'a', label: 'Rush Yds', sort: (st) => pickNum(st, names, 'rushingYards') },
        { key: 'b', label: 'Car', sort: (st) => pickNum(st, names, 'rushingAttempts') },
        { key: 'c', label: 'Rush TD', sort: (st) => pickNum(st, names, 'rushingTouchdowns') },
        { key: 'd', label: 'Y/A', sort: (st) => pickNum(st, names, 'yardsPerRushAttempt') },
      ];
    }
    if (categoryName === 'defensive') {
      return [
        { key: 'a', label: 'Tck', sort: (st) => firstPositive(st, names, ['totalTackles', 'soloTackles']) },
        { key: 'b', label: 'Sck', sort: (st) => pickNum(st, names, 'sacks') },
        { key: 'c', label: 'INT', sort: (st) => pickNum(st, names, 'interceptions') },
        { key: 'd', label: 'PD', sort: (st) => pickNum(st, names, 'passesDefended') },
      ];
    }
    /* passing + default */
    return [
      { key: 'a', label: 'Pass Yds', sort: (st) => pickNum(st, names, 'passingYards') },
      { key: 'b', label: 'Pass TD', sort: (st) => pickNum(st, names, 'passingTouchdowns') },
      { key: 'c', label: 'INT', sort: (st) => pickNum(st, names, 'interceptions') },
      { key: 'd', label: 'Rating', sort: (st) => pickNum(st, names, 'QBRating') },
    ];
  })();

  const fmt = (v, isRating) => {
    if (v == null || !Number.isFinite(v)) return '—';
    if (isRating) return v > 0 ? v.toFixed(1) : '—';
    if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v));
    return v.toFixed(1);
  };

  const rawRows = cat.splits
    .filter((s) => (s.displayName || '').toLowerCase().startsWith('vs '))
    .map((s) => {
      const st = s.stats || [];
      const opp = (s.abbreviation || s.displayName || '')
        .replace(/^vs\s+/i, '')
        .trim();
      const vals = slotDefs.map((def) => ({
        key: def.key,
        label: def.label,
        raw: def.sort(st),
      }));
      const sortKey = vals[0]?.raw ?? 0;
      return { opp, games: null, vals, sortKey };
    })
    .filter((r) => r.opp)
    .sort((a, b) => b.sortKey - a.sortKey);

  const rows = rawRows.map((r) => {
    const row = { opp: r.opp, games: r.games };
    r.vals.forEach(({ key, label, raw }) => {
      row[key] = fmt(raw, label === 'Rating');
    });
    return row;
  });

  const columns = slotDefs.map((d) => ({ key: d.key, label: d.label }));
  const footnote =
    'Totals from ESPN splits (by opponent). Games played per opponent not in this feed (—). Column meanings follow the stat tab you selected.';

  return { columns, rows, footnote };
}

export function buildStatViewsForPlayer(statsJson, splitsJson, positionAbbr) {
  const rawNames = listStatCategoryNames(statsJson);
  const order = orderCategoryNames(rawNames);
  const defaultKey = defaultStatCategoryForPosition(positionAbbr, order) || order[0] || null;
  const views = {};

  for (const name of order) {
    const parsed = parseSeasonRecapForCategory(statsJson, name);
    const highlights = buildHighlightsFromCategory(statsJson, name);
    const comparison = buildComparisonFromCategory(statsJson, name);
    const matchupGrid = buildMatchupGridFromSplits(splitsJson, name);
    const hasRecap = parsed.recapColumns?.length > 0 && parsed.recapRows?.length > 0;
    views[name] = {
      key: name,
      title: formatStatCategoryTitle(name),
      highlights,
      comparison,
      seasons: parsed.seasons.slice(-6),
      seasonRecap: hasRecap
        ? {
            categoryName: parsed.categoryName,
            columns: parsed.recapColumns,
            rows: parsed.recapRows.slice(-12),
          }
        : null,
      matchupGrid,
    };
  }

  return { order, defaultKey, views };
}
