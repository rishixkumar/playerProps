/**
 * Full-tab loading gate: rankings + prop math first, then headshot CDN fetches.
 * @param {{ phase: 'fetching' | 'assets' }} props
 */
export function PropsTabLoadingState({ phase }) {
  const title =
    phase === 'assets'
      ? 'Loading player headshots…'
      : 'Loading rankings and prop lines…';

  return (
    <div className="pp-tab-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="pp-tab-loading-spinner" aria-hidden />
      <p className="pp-tab-loading-title">{title}</p>
      <p className="pp-tab-loading-sub">
        Your board appears once stats, lines, and images are ready — nothing flashes in half-loaded.
      </p>
    </div>
  );
}
