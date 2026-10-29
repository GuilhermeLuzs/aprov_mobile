import { useSyncExternalStore } from 'react';
import type { ApiReview } from '../api';
import { mockItemId, mockTagId } from '../api/catalogBridge';
import { products, reviews, tagById } from '../mocks';
import { toReviewMedia } from '../screens/CreateReview/draft';
import type { Product, Review, Tag } from '../types';
import { withRatingStats } from '../utils/rating';
import { useDeactivatedIds } from './deactivated';
import { reportedIds, useReports } from './reports';
import { useSession } from './session';

const MEDIA_FALLBACK_SIDE = 1080;

let published: Review[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function tagsFrom(apiTags: { id: number }[]): Tag[] {
  return apiTags
    .map((t) => mockTagId(t.id))
    .map((id) => (id ? tagById[id] : undefined))
    .filter((t): t is Tag => t !== undefined);
}

export function reviewFromApi(api: ApiReview, authorId: string): Review | null {
  const productId = mockItemId(api.itemId);
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  return {
    id: `api-${api.id}`,
    productId: product.id,
    companyId: product.companyId,
    authorId,
    createdAt: api.createdAt,
    editedAt: null,
    title: '',
    characteristics: [
      { key: 'entrega', rating: api.deliveryRating },
      { key: 'qualidade', rating: api.qualityRating },
      { key: 'conformidade', rating: api.conformityRating },
      { key: 'custo_beneficio', rating: api.valueRating },
    ],
    averageRating: api.averageRating,
    positiveTags: tagsFrom(api.positiveTags),
    negativeTags: tagsFrom(api.negativeTags),
    media: toReviewMedia(
      api.media.map((m) => ({
        id: String(m.id),
        kind: m.type,
        uri: m.url,
        width: MEDIA_FALLBACK_SIDE,
        height: MEDIA_FALLBACK_SIDE,
        durationSeconds: 0,
      })),
    ),
    comment: api.comment,
    wouldBuyAgain: api.wouldBuyAgain,
    agreements: 0,
    disagreements: 0,
    comments: [],
    commentCount: 0,
    shares: 0,
    coinsReward: api.rewards?.coins ?? 0,
    xpReward: api.rewards?.xp ?? 0,
  };
}

export function publishReview(review: Review): void {
  published = [review, ...published];
  emit();
}

export function resetPublishedReviews(next: Review[]): void {
  published = next;
  emit();
}

export function getPublishedReviews(): Review[] {
  return published;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePublishedReviews(): Review[] {
  return useSyncExternalStore(subscribe, getPublishedReviews, getPublishedReviews);
}

export function useAllReviews(): Review[] {
  const own = usePublishedReviews();
  const hidden = useDeactivatedIds();
  const session = useSession();
  const reported = reportedIds(useReports(), session?.id ?? '', 'review');
  return [...own, ...reviews].filter(
    (r) => !hidden.includes(r.authorId) && !reported.includes(r.id),
  );
}

export function useProductsWithStats(): Product[] {
  const all = useAllReviews();
  return products.map((p) => withRatingStats(p, all));
}
