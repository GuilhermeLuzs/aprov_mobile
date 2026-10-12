export type PageItem = number | 'gap';

const SHOW_ALL_LIMIT = 5;

export function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= SHOW_ALL_LIMIT) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const visible = [1, pageCount, page - 1, page, page + 1]
    .filter((n, i, all) => n >= 1 && n <= pageCount && all.indexOf(n) === i)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  visible.forEach((n, i) => {
    const previous = visible[i - 1];
    if (previous !== undefined && n - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && n - previous > 2) items.push('gap');
    items.push(n);
  });
  return items;
}
