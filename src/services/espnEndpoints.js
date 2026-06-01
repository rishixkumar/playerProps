/**
 * Browser-safe URLs for ESPN hosts.
 * - `site.api.espn.com` is proxied in dev (`src/setupProxy.js`) and should be rewritten in prod.
 * - `site.web.api` and `sports.core.api` currently allow CORS *; we keep them direct.
 */
export function espnSiteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.origin}/api/espn-site${p}`;
    }
    if (process.env.REACT_APP_ESPN_SITE_PROXY === '1') {
      return `${window.location.origin}/api/espn-site${p}`;
    }
  }
  return `https://site.api.espn.com${p}`;
}
