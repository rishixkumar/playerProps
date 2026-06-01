/** Map chip labels to substrings matched against stat labels / keys. */
const CHIP_TOKENS = {
  Yards: ['yds', 'yard'],
  TDs: ['td', 'touch'],
  INTs: ['int', 'pick'],
  'CMP%': ['cmp', 'comp', 'pct'],
  Rating: ['rating', 'rtg', 'qbr'],
  'ANY/A': ['any', 'avg'],
};

/**
 * @param {string} query
 * @param {string[]} activeChips
 * @returns {string[]}
 */
export function normalizeStatTokens(query, activeChips = []) {
  const tokens = [];
  const q = (query || '').trim().toLowerCase();
  if (q.length >= 1) tokens.push(q);
  (activeChips || []).forEach((chip) => {
    (CHIP_TOKENS[chip] || [chip.toLowerCase()]).forEach((t) => tokens.push(t));
  });
  return [...new Set(tokens.filter(Boolean))];
}

export function filterComparisonItems(items, tokens) {
  if (!items?.length || !tokens.length) return items || [];
  const filtered = items.filter((row) =>
    tokens.some(
      (tok) =>
        row.label.toLowerCase().includes(tok) || String(row.key).toLowerCase().includes(tok)
    )
  );
  return filtered.length ? filtered : items;
}

/**
 * @param {{ columns: {key:string,label:string}[], rows: object[], categoryName?: string|null }|null} recap
 * @param {string[]} tokens
 */
export function filterSeasonRecap(recap, tokens) {
  if (!recap?.columns?.length || !tokens.length) return recap;
  const keepIdx = recap.columns
    .map((c, i) => ({ c, i }))
    .filter(
      ({ c }) =>
        tokens.some(
          (tok) =>
            c.label.toLowerCase().includes(tok) || c.key.toLowerCase().includes(tok)
        )
    )
    .map((x) => x.i);
  if (!keepIdx.length) return recap;
  return {
    ...recap,
    columns: keepIdx.map((i) => recap.columns[i]),
    rows: recap.rows.map((r) => ({
      ...r,
      values: keepIdx.map((i) => r.values[i]),
    })),
  };
}

export function filterMatchupRows(rows, tokens) {
  if (!rows?.length || !tokens.length) return rows || [];
  const filtered = rows.filter((r) =>
    tokens.some((tok) => (r.opp || '').toLowerCase().includes(tok))
  );
  return filtered.length ? filtered : rows;
}
