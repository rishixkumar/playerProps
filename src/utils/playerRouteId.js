/**
 * @param {string|undefined} routeParam - React Router :id
 * @returns {{ kind: 'mock', id: string } | { kind: 'espn', espnId: string } | { kind: 'unknown', raw: string }}
 */
export function parsePlayerRouteId(routeParam) {
  const raw = (routeParam || '').trim();
  if (!raw) return { kind: 'unknown', raw: '' };
  if (raw === 'demo-qb' || raw === 'demo-qb-2' || raw === 'demo-rb') {
    return { kind: 'mock', id: raw };
  }
  const m = raw.match(/^espn-(\d+)$/i);
  if (m) return { kind: 'espn', espnId: m[1] };
  if (/^\d+$/.test(raw)) return { kind: 'espn', espnId: raw };
  return { kind: 'unknown', raw };
}
