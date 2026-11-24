import {
  REVIEW_CHARACTERISTIC_KEYS,
  type DraftRewardFacts,
  type Product,
  type ProductKind,
  type Review,
  type ReviewCharacteristicKey,
  type Tag,
} from '../../types';
import { toReviewMedia } from '../../utils/media';

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

export function draftRewardFacts(draft: Draft): DraftRewardFacts {
  return {
    completed: starsDone(draft) && tagsDone(draft) && commentDone(draft),
    tagCount: draft.positiveTagIds.length + draft.negativeTagIds.length,
    hasVideo: draft.media.some((m) => m.kind === 'video'),
    photoCount: draft.media.filter((m) => m.kind === 'photo').length,
    commentLength: draft.comment.trim().length,
  };
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

export function buildReview(draft: Draft, product: Product, id: string, authorId: string, tags: Tag[]): Review {
  const byId = (tagId: string) => tags.find((tag) => tag.id === tagId);
  return {
    id,
    productId: product.id,
    companyId: product.companyId,
    authorId,
    createdAt: new Date().toISOString(),
    editedAt: null,
    versions: [],
    title: '',
    characteristics: REVIEW_CHARACTERISTIC_KEYS.map((key) => ({
      key,
      rating: draft.characteristics[key],
    })),
    averageRating: averageRating(draft),
    positiveTags: draft.positiveTagIds.map(byId).filter((tag): tag is Tag => tag !== undefined),
    negativeTags: draft.negativeTagIds.map(byId).filter((tag): tag is Tag => tag !== undefined),
    media: toReviewMedia(draft.media),
    mediaFiles: draft.media.map((m) => ({ id: m.id, kind: m.kind, previewUri: m.uri })),
    comment: draft.comment.trim(),
    wouldBuyAgain: draft.wouldBuyAgain,
    agreements: 0,
    disagreements: 0,
    myVote: null,
    comments: [],
    commentCount: 0,
    shares: 0,
    coinsReward: product.coinsReward,
    xpReward: product.xpReward,
  };
}

export type ChatMessage = { id: string; author: 'mauricio' | 'user'; text: string };

const drafts = new Map<string, Draft>();
const chats = new Map<string, ChatMessage[]>();

export function loadDraft(key: string, fallback: () => Draft = emptyDraft): Draft {
  return drafts.get(key) ?? fallback();
}

export const EXISTING_MEDIA_PREFIX = 'api-media-';

export function existingMediaId(media: DraftMedia): number | null {
  return media.id.startsWith(EXISTING_MEDIA_PREFIX)
    ? Number(media.id.slice(EXISTING_MEDIA_PREFIX.length))
    : null;
}

export function saveDraft(key: string, draft: Draft): void {
  drafts.set(key, draft);
}

export function loadChat(productId: string): ChatMessage[] | undefined {
  return chats.get(productId);
}

export function saveChat(productId: string, messages: ChatMessage[]): void {
  chats.set(productId, messages);
}

export function clearDraft(key: string): void {
  drafts.delete(key);
  chats.delete(key);
}
