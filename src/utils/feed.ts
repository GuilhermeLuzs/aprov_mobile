import type { Review } from '../types';

export function sortFeed(list: Review[], isPreferred: (review: Review) => boolean): Review[] {
  return [...list].sort(
    (a, b) =>
      Number(isPreferred(b)) - Number(isPreferred(a)) ||
      Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function spaceAuthors(sorted: Review[], gap: number): Review[] {
  const result: Review[] = [];
  const pool = [...sorted];

  while (pool.length > 0) {
    const recentAuthors = result.slice(-(gap - 1)).map((r) => r.authorId);
    const spaced = pool.findIndex((r) => !recentAuthors.includes(r.authorId));
    const pick = spaced === -1 ? 0 : spaced;
    result.push(pool[pick]);
    pool.splice(pick, 1);
  }

  return result;
}
