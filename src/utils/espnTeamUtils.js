/**
 * Pick the player's current NFL team from ESPN stats `teams` map.
 * Prefer roster/search hint, then the single active franchise, else first entry.
 */
export function pickActiveTeamAbbr(teamsMap, hintAbbr) {
  const teams = Object.values(teamsMap || {}).filter(Boolean);
  if (!teams.length) return (hintAbbr && String(hintAbbr).trim()) || '—';

  const hint = String(hintAbbr || '')
    .trim()
    .toUpperCase();
  if (hint && hint !== '—') {
    const exact = teams.find((t) => String(t.abbreviation || '').toUpperCase() === hint);
    if (exact) return exact.abbreviation;
  }

  const active = teams.filter((t) => t.isActive === true);
  if (active.length === 1) return active[0].abbreviation || hint || '—';
  if (active.length > 1 && hint) {
    const m = active.find((t) => String(t.abbreviation || '').toUpperCase() === hint);
    if (m) return m.abbreviation;
    return active[0].abbreviation || '—';
  }
  if (active.length > 0) return active[0].abbreviation || '—';

  return teams[0].abbreviation || hint || '—';
}
