const NFL_TEAMS = [
  'Chiefs', 'Eagles', 'Patriots', 'Bills', 'Bengals', 'Ravens', 'Cowboys',
  'Seahawks', '49ers', 'Rams', 'Packers', 'Steelers', 'Dolphins', 'Vikings',
  'Bears', 'Saints', 'Buccaneers', 'Falcons', 'Panthers', 'Giants', 'Jets',
  'Commanders', 'Chargers', 'Broncos', 'Texans', 'Colts', 'Jaguars', 'Titans',
  'Raiders', 'Cardinals', 'Lions', 'Browns',
];

const KNOWN_PLAYERS = [
  'Mahomes', 'Allen', 'Burrow', 'Hurts', 'Stroud', 'Lawrence', 'Herbert',
  'Lamar', 'Jackson', 'Brady', 'Chase', 'Lamb', 'Jefferson', 'Hill', 'Adams',
  'Brown', 'McCaffrey', 'Henry', 'Cook', 'Barkley', 'Andrews', 'Kelce',
  'Metcalf', 'Kupp', 'Evans',
];

// Team abbreviation → ESPN URL segment map for team-specific news
const TEAM_ABBR_MAP = {
  kc: 'kc', chiefs: 'kc',
  phi: 'phi', eagles: 'phi',
  ne: 'ne', patriots: 'ne',
  buf: 'buf', bills: 'buf',
  cin: 'cin', bengals: 'cin',
  bal: 'bal', ravens: 'bal',
  dal: 'dal', cowboys: 'dal',
  sea: 'sea', seahawks: 'sea',
  sf: 'sf', '49ers': 'sf',
  lar: 'lar', rams: 'lar',
  gb: 'gb', packers: 'gb',
  pit: 'pit', steelers: 'pit',
  mia: 'mia', dolphins: 'mia',
  min: 'min', vikings: 'min',
  chi: 'chi', bears: 'chi',
  no: 'no', saints: 'no',
  tb: 'tb', buccaneers: 'tb',
  atl: 'atl', falcons: 'atl',
  car: 'car', panthers: 'car',
  nyg: 'nyg', giants: 'nyg',
  nyj: 'nyj', jets: 'nyj',
  wsh: 'wsh', commanders: 'wsh',
  lac: 'lac', chargers: 'lac',
  den: 'den', broncos: 'den',
  hou: 'hou', texans: 'hou',
  ind: 'ind', colts: 'ind',
  jax: 'jax', jaguars: 'jax',
  ten: 'ten', titans: 'ten',
  lv: 'lv', raiders: 'lv',
  ari: 'ari', cardinals: 'ari',
  det: 'det', lions: 'det',
  cle: 'cle', browns: 'cle',
};

const STATIC_NEWS = [
  {
    id: 's1',
    headline: 'A.J. Brown traded to New England Patriots',
    summary: 'The Eagles send star WR A.J. Brown to the Patriots. New England sends a 1st-round pick and a 3rd-round pick to Philadelphia.',
    url: null,
    publishedAt: 'Jun 1, 2026',
    source: 'ESPN',
    imageUrl: null,
    category: 'TRADE',
    tags: ['AJ Brown', 'Patriots', 'Eagles', 'WR'],
  },
  {
    id: 's2',
    headline: 'Patrick Mahomes signs record extension with Chiefs',
    summary: 'KC locks up Mahomes through 2032 in an NFL record deal for guaranteed money.',
    url: null,
    publishedAt: 'May 28, 2026',
    source: 'NFL.com',
    imageUrl: null,
    category: 'CONTRACT',
    tags: ['Mahomes', 'Chiefs'],
  },
  {
    id: 's3',
    headline: "Ja'Marr Chase becomes highest-paid WR in NFL history",
    summary: 'Cincinnati agrees to a 5-year, $185M extension with Chase.',
    url: null,
    publishedAt: 'May 20, 2026',
    source: 'The Athletic',
    imageUrl: null,
    category: 'CONTRACT',
    tags: ['Chase', 'Bengals'],
  },
  {
    id: 's4',
    headline: '2026 NFL Draft: Three QBs in top 5',
    summary: "Clemson's Marcus Holt goes #1 overall to Tennessee.",
    url: null,
    publishedAt: 'Apr 24, 2026',
    source: 'NFL.com',
    imageUrl: null,
    category: 'DRAFT',
    tags: ['NFL Draft', '2026 Draft'],
  },
  {
    id: 's5',
    headline: 'Super Bowl LX: Chiefs win 31-24 in OT',
    summary: 'Mahomes threw for 341 yards as KC won their third consecutive Super Bowl.',
    url: null,
    publishedAt: 'Feb 2, 2026',
    source: 'ESPN',
    imageUrl: null,
    category: 'GAME',
    tags: ['Super Bowl', 'Chiefs', 'Eagles', 'Mahomes'],
  },
  {
    id: 'ee-28-3',
    headline: 'The Greatest Comeback: 28-3 (Super Bowl LI)',
    summary:
      'Super Bowl LI, Feb 5 2017: Patriots trailed Falcons 28-3, rallied to win 34-28 in OT. Tom Brady threw for 466 yards. The biggest blown lead in championship game history.',
    url: 'https://en.wikipedia.org/wiki/Super_Bowl_LI',
    publishedAt: 'Feb 5, 2017',
    source: 'History',
    imageUrl: null,
    category: 'GAME',
    tags: ['Patriots', 'Falcons', 'Tom Brady', 'Super Bowl LI', '28-3', 'Comeback'],
  },
];

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function inferCategory(espnArticle) {
  const text = (espnArticle.headline + ' ' + (espnArticle.description || '')).toLowerCase();
  if (/traded?|trade/.test(text)) return 'TRADE';
  if (/signed?|contract|extension|deal|million/.test(text)) return 'CONTRACT';
  if (/injur|hurt|ir |placed on|surgery|out for/.test(text)) return 'INJURY';
  if (/draft|pick|selected|round/.test(text)) return 'DRAFT';
  if (/score|final|win|loss|defeated|beat|overtime/.test(text)) return 'GAME';
  return 'NEWS';
}

function inferTags(text) {
  const tags = [];
  for (const t of [...NFL_TEAMS, ...KNOWN_PLAYERS]) {
    if (text.toLowerCase().includes(t.toLowerCase())) tags.push(t);
  }
  return [...new Set(tags)].slice(0, 5);
}

function parseEspnArticle(raw) {
  const imageUrl =
    raw.images && raw.images.length > 0 ? raw.images[0].url || null : null;
  const url = raw.links?.web?.href || null;
  const text = raw.headline + ' ' + (raw.description || '');
  return {
    id: String(raw.id || Math.random()),
    headline: raw.headline || '',
    summary: raw.description || '',
    url,
    publishedAt: formatDate(raw.published),
    source: raw.byline || 'ESPN',
    imageUrl,
    category: inferCategory(raw),
    tags: inferTags(text),
  };
}

function dedupeById(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

async function fetchEspnNews(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`ESPN news fetch failed: ${res.status}`);
  const data = await res.json();
  return (data.articles || []).map(parseEspnArticle);
}

export async function fetchHeadlines() {
  try {
    const live = await fetchEspnNews(
      '/api/espn-news/apis/site/v2/sports/football/nfl/news?limit=20'
    );
    return dedupeById([...live, ...STATIC_NEWS]);
  } catch {
    return [...STATIC_NEWS];
  }
}

export async function fetchNews(query) {
  if (!query || !query.trim()) return fetchHeadlines();

  const q = query.toLowerCase().trim();

  // Easter egg: 28-3
  if (q.includes('28') && q.includes('3')) {
    const rest = await fetchHeadlines();
    const egg = STATIC_NEWS.find((n) => n.id === 'ee-28-3');
    return dedupeById([egg, ...rest].filter(Boolean));
  }

  // Fetch live headlines
  const live = await fetchHeadlines().catch(() => []);

  // Also try fetching team-specific news if query matches a known team token
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  const teamAbbr = tokens.map((t) => TEAM_ABBR_MAP[t]).find(Boolean);
  let teamNews = [];
  if (teamAbbr) {
    teamNews = await fetchEspnNews(
      `/api/espn-news/apis/site/v2/sports/football/nfl/teams/${teamAbbr}/news?limit=10`
    ).catch(() => []);
  }

  const all = dedupeById([...teamNews, ...live, ...STATIC_NEWS]);

  // Filter by any query token (length > 2)
  const filterTokens = tokens.filter((t) => t.length > 2);
  const filtered = all.filter((a) => {
    const text = (
      a.headline +
      ' ' +
      (a.summary || '') +
      ' ' +
      (a.tags || []).join(' ')
    ).toLowerCase();
    return filterTokens.some((tok) => text.includes(tok));
  });

  return filtered.length > 0 ? filtered : all.slice(0, 5);
}
