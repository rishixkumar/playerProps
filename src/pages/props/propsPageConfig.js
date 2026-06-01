export const PROPS_TABS = ['Featured', 'QB Props', 'WR Props', 'RB Props', 'Best Value'];

export function getPropsTabBlurb(tab) {
  if (tab === 'Featured') {
    return 'Top 20 by combined scrimmage yards (pass + rush + rec) from the latest regular season ESPN leaderboards.';
  }
  if (tab === 'QB Props') return 'Top 20 quarterbacks by passing yards.';
  if (tab === 'WR Props') return 'Top 20 wide receivers by receiving yards.';
  if (tab === 'RB Props') return 'Top 20 running backs by rushing yards.';
  if (tab === 'Best Value') {
    return 'Top 20 edges vs. line: biggest model gaps among leading scrimmage-yard producers.';
  }
  return '';
}
