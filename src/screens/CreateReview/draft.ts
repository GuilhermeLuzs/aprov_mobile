import { currentUser, tagById } from '../../mocks';
import {
  REVIEW_CHARACTERISTIC_KEYS,
  type Media,
  type Product,
  type ProductKind,
  type Review,
  type ReviewCharacteristicKey,
} from '../../types';

export const TOTAL_STEPS = 5;
export const MAX_MEDIA = 6;
export const COMMENT_MAX_LENGTH = 1000;

export type DraftMedia = {
  id: string;
  kind: 'photo' | 'video';
  uri: string;
  width: number;
  height: number;
  durationSeconds: number;
};

export type Draft = {
  step: number;
  characteristics: Record<ReviewCharacteristicKey, number>;
  positiveTagIds: string[];
  negativeTagIds: string[];
  media: DraftMedia[];
  comment: string;
  wouldBuyAgain: boolean | null;
  mediaConsent: boolean;
};

export function emptyDraft(): Draft {
  return {
    step: 1,
    characteristics: { entrega: 0, qualidade: 0, conformidade: 0, custo_beneficio: 0 },
    positiveTagIds: [],
    negativeTagIds: [],
    media: [],
    comment: '',
    wouldBuyAgain: null,
    mediaConsent: false,
  };
}

export function starsDone(draft: Draft): boolean {
  return REVIEW_CHARACTERISTIC_KEYS.every((key) => draft.characteristics[key] > 0);
}

export function tagsDone(draft: Draft): boolean {
  return draft.positiveTagIds.length + draft.negativeTagIds.length > 0;
}

export function mediaDone(draft: Draft): boolean {
  return draft.media.length > 0;
}

export function commentDone(draft: Draft): boolean {
  return draft.comment.trim() !== '';
}

export function mediaRequired(kind: ProductKind): boolean {
  return kind === 'product';
}

export function averageRating(draft: Draft): number {
  const rated = REVIEW_CHARACTERISTIC_KEYS.map((key) => draft.characteristics[key]).filter(
    (value) => value > 0,
  );
  if (rated.length === 0) return 0;
  return Math.round((rated.reduce((sum, value) => sum + value, 0) / rated.length) * 10) / 10;
}

export function isDirty(draft: Draft): boolean {
  return (
    REVIEW_CHARACTERISTIC_KEYS.some((key) => draft.characteristics[key] > 0) ||
    tagsDone(draft) ||
    mediaDone(draft) ||
    commentDone(draft) ||
    draft.wouldBuyAgain !== null
  );
}

export function toReviewMedia(media: DraftMedia[]): Media[] {
  if (media.length === 0) return [];
  const photos = media.filter((m) => m.kind === 'photo');
  if (photos.length > 1 && photos.length === media.length) {
    return [
      {
        id: 'draft-carousel',
        type: 'carousel',
        items: photos.map((p) => ({ uri: p.uri, width: p.width, height: p.height })),
      },
    ];
  }
  const first = media[0];
  if (first.kind === 'video') {
    return [
      {
        id: first.id,
        type: 'video',
        uri: first.uri,
        thumbnailUri: '',
        durationSeconds: first.durationSeconds,
      },
    ];
  }
  return [{ id: first.id, type: 'photo', uri: first.uri, width: first.width, height: first.height }];
}

export function buildReview(draft: Draft, product: Product, id: string): Review {
  return {
    id,
    productId: product.id,
    companyId: product.companyId,
    authorId: currentUser.id,
    createdAt: new Date().toISOString(),
    editedAt: null,
    title: '',
    characteristics: REVIEW_CHARACTERISTIC_KEYS.map((key) => ({
      key,
      rating: draft.characteristics[key],
    })),
    averageRating: averageRating(draft),
    positiveTags: draft.positiveTagIds.map((tagId) => tagById[tagId]).filter(Boolean),
    negativeTags: draft.negativeTagIds.map((tagId) => tagById[tagId]).filter(Boolean),
    media: toReviewMedia(draft.media),
    comment: draft.comment.trim(),
    wouldBuyAgain: draft.wouldBuyAgain,
    agreements: 0,
    disagreements: 0,
    comments: [],
    commentCount: 0,
    shares: 0,
    coinsReward: product.coinsReward,
    xpReward: product.xpReward,
  };
}

const drafts = new Map<string, Draft>();

export function loadDraft(productId: string): Draft {
  return drafts.get(productId) ?? emptyDraft();
}

export function saveDraft(productId: string, draft: Draft): void {
  drafts.set(productId, draft);
}

export function clearDraft(productId: string): void {
  drafts.delete(productId);
}
