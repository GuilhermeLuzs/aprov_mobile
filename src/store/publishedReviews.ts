import { useSyncExternalStore } from 'react';
import type { ApiReview } from '../api';
import { mockItemId, mockTagId } from '../api/catalogBridge';
import { products, reviews, tagById } from '../mocks';
import { toReviewMedia } from '../screens/CreateReview/draft';
import type { Product, Review, ReviewCharacteristic, Tag } from '../types';
import { withRatingStats } from '../utils/rating';
import { useDeactivatedIds } from './deactivated';
import { reportedIds, useReports } from './reports';
import { useSession } from './session';

const MEDIA_FALLBACK_SIDE = 1080;

export const ANONYMOUS_AUTHOR_ID = 'autor-anonimo';

let published: Review[] = [];
const apiSources = new Map<string, ApiReview>();
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

function characteristicsFrom(ratings: {
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
}): ReviewCharacteristic[] {
  return [
    { key: 'entrega', rating: ratings.deliveryRating },
    { key: 'qualidade', rating: ratings.qualityRating },
    { key: 'conformidade', rating: ratings.conformityRating },
    { key: 'custo_beneficio', rating: ratings.valueRating },
  ];
}

export function reviewFromApi(api: ApiReview, authorId: string): Review | null {
  const productId = mockItemId(api.itemId);
  const product = products.find((p) => p.id === productId);
  if (!product) return null;
  const id = `api-${api.id}`;
  apiSources.set(id, api);
  return {
    id,
    productId: product.id,
    companyId: product.companyId,
    authorId,
    createdAt: api.createdAt,
    editedAt: api.editedAt,
    versions: (api.versions ?? []).map((version) => ({
      id: `api-version-${version.id}`,
      publishedAt: version.publishedAt,
      characteristics: characteristicsFrom(version),
      averageRating: version.averageRating,
      comment: version.comment,
    })),
    title: '',
    characteristics: characteristicsFrom(api),
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

export function replacePublishedReview(review: Review): void {
  published = published.map((r) => (r.id === review.id ? review : r));
  emit();
}

export function dropPublishedReview(reviewId: string): void {
  published = published.filter((r) => r.id !== reviewId);
  apiSources.delete(reviewId);
  emit();
}

export function apiSourceOf(reviewId: string): ApiReview | undefined {
  return apiSources.get(reviewId);
}

export function resetPublishedReviews(next: Review[]): void {
  published = next;
  emit();
}

function withoutAuthor(review: Review): Review {
  return { ...review, authorId: ANONYMOUS_AUTHOR_ID, media: [] };
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
  return [...own, ...reviews]
    .filter((r) => !reported.includes(r.id))
    .map((r) => (hidden.includes(r.authorId) ? withoutAuthor(r) : r));
}

export function useProductsWithStats(): Product[] {
  const all = useAllReviews();
  return products.map((p) => withRatingStats(p, all));
}
