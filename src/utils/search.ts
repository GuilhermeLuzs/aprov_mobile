export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesSearch(text: string, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query);
  return normalizedQuery === '' || normalizeForSearch(text).includes(normalizedQuery);
}
