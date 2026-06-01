/**
 * Preload a single image URL. Always settles (404 does not hang the UI).
 * @param {string | null | undefined} src
 * @returns {Promise<void>}
 */
export function preloadImage(src) {
  if (!src || typeof src !== 'string') return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Wait until all player headshot URLs have loaded (or failed).
 * @param {Array<{ headshotUrl?: string }>} players
 * @returns {Promise<void>}
 */
export async function preloadPlayerHeadshots(players) {
  if (!Array.isArray(players) || !players.length) return;
  await Promise.all(players.map((p) => preloadImage(p?.headshotUrl)));
}
