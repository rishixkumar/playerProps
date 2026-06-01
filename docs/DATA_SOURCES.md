# NFL player data sources

This app intentionally **routes each type of data to the best source** and avoids duplicate fetches for the same fact (e.g. one headshot provider, one season-totals provider). Below are the **five** sources we standardize on, with roles and caveats.

## 1. ESPN Site API (`site.api.espn.com`)

- **Use for:** League team list, **per-team rosters** (player id, name, position, headshot URL, team).
- **Why:** Stable JSON; powers ESPN’s own NFL pages. Ideal for building a **search index** without scraping HTML.
- **Browser caveat:** Many browsers block direct `fetch` to this host from `localhost` or your app origin because **`Access-Control-Allow-Origin` is missing** on some responses. This repo **proxies** those calls:
  - **Development:** `src/setupProxy.js` maps `/api/espn-site/*` → `https://site.api.espn.com/*` (CRA dev server).
  - **Production (e.g. Vercel):** `vercel.json` rewrites the same path. For other hosts, add an equivalent rewrite or set `REACT_APP_ESPN_SITE_PROXY=1` and serve `/api/espn-site` from your edge.
- **Client routing:** `src/services/espnEndpoints.js` (`espnSiteUrl`) builds same-origin URLs on localhost / when the env flag is set.
- **Caveat:** Undocumented; schemas can change. Cache roster index in `sessionStorage` with a TTL.

## 2. ESPN Core API (`sports.core.api.espn.com`)

- **Use for:** **Canonical athlete record** — age, height/weight, jersey, `displayName`, birth place, **official headshot** URL.
- **Why:** Single small JSON per player; **CORS `*`**. Best “source of truth” for identity fields after the user picks a player.

## 3. ESPN Web “common” API (`site.web.api.espn.com`)

- **Use for:** **Season / career stat tables** (`…/athletes/{id}/stats`), **game schedule / results shell** (`…/athletes/{id}/gamelog`), **splits** (`…/athletes/{id}/splits`), and **overview** via **`site.api`** (`/apis/common/v3/sports/football/nfl/athletes/{id}/overview`) for headline stats + recent news — overview uses the same **proxy** as rosters (`espnSiteUrl`).
- **Why:** Rich, position-aware stat splits; `site.web` endpoints we call typically allow browser CORS; `site.api` overview is routed through the proxy when needed.
- **Caveat:** Gamelog payload used here is strong on **score / opponent / week**; per-game passing lines may require a different resource later—see code comments.

## 4. TheSportsDB (public API)

- **Use for:** **Long-form bio / description** (`strDescriptionEN`), optional cross-check fields (`strBirthLocation`, `idESPN` when present).
- **Why:** **CORS `*`** (demo key `3` is rate-limited; set `REACT_APP_SPORTSDB_API_KEY` for production). Complements ESPN without duplicating numeric stats we already parse from ESPN.
- **Flow:** After ESPN athlete is loaded, **search by name**, pick the row where `idESPN` matches the ESPN athlete id, then **`lookupplayer.php`** for the full bio text—**no** second stats pull.

## 5. nflverse (releases / `nflreadr`)

- **Use for:** **Offline research**, ID crosswalks (GSIS / ESPN / PFR), and reproducible analytics—not wired in the browser bundle by default (release URLs are signed / heavy).
- **Why:** Community “source of truth” for NFL analytics pipelines; best for a **future** server job that materializes a normalized player table.
- **Caveat:** Do not hammer GitHub release assets from the client; prefer scheduled ETL or a first-party API.

---

### Legal / product note

ESPN’s JSON endpoints are **not a published developer product**. Use responsibly (caching, low concurrency, attribution in UI). For commercial scale, plan on **licensed data** (e.g. Sportradar, Genius, official NFL feeds) or host your own normalized store populated from allowed sources.
