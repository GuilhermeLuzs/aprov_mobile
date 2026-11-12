import { Platform } from 'react-native';
import type { EarnedRewards, ProductKind } from '../types';
import type { ApiCompanySummary, ApiPage, ApiTag } from './catalog';
import { apiRequest } from './client';

export type ReviewMediaUpload = {
  uri: string;
  kind: 'photo' | 'video';
};

export type ApiReviewAuthor = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  level: number;
};

export type ApiReviewItem = {
  id: number;
  companyId: number;
  kind: ProductKind;
  title: string;
  coverUrl?: string | null;
  company?: ApiCompanySummary;
};

export type ApiReviewMedia = {
  id: number;
  type: 'photo' | 'video';
  url: string;
  coverUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
};

export type ApiVote = 'agree' | 'disagree';

export type ApiVoteTally = { agreements: number; disagreements: number };

export type ApiReviewVersion = {
  id: number;
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
  averageRating: number;
  comment: string;
  wouldBuyAgain: boolean;
  tags?: ApiTag[];
  media?: ApiReviewMedia[];
  publishedAt: string;
};

export type ApiReview = {
  id: number;
  itemId: number;
  customerId: number | null;
  author?: ApiReviewAuthor | null;
  item?: ApiReviewItem;
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
  averageRating: number;
  comment: string;
  wouldBuyAgain: boolean;
  mediaConsent: boolean;
  positiveTags: ApiTag[];
  negativeTags: ApiTag[];
  media: ApiReviewMedia[];
  rewards?: EarnedRewards;
  versions?: ApiReviewVersion[];
  agreements?: number;
  disagreements?: number;
  commentCount?: number;
  myVote?: ApiVote | null;
  votesByVersion?: ApiVoteTally[];
  createdAt: string;
  editedAt: string | null;
};

export type ApiReviewPage = ApiPage & { total: number; reviews: ApiReview[] };

export type FeedTab = 'for_you' | 'following';

export type CreateReviewPayload = {
  itemId: number;
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
  tagIds: number[];
  comment: string;
  wouldBuyAgain: boolean;
  media: ReviewMediaUpload[];
};

export type UpdateReviewPayload = Omit<CreateReviewPayload, 'itemId'> & {
  keepMediaIds: number[];
  mediaConsent: boolean;
};

async function appendMedia(form: FormData, item: ReviewMediaUpload, index: number): Promise<void> {
  const extension = item.kind === 'video' ? 'mp4' : 'jpg';
  const type = item.kind === 'video' ? 'video/mp4' : 'image/jpeg';
  const name = `media-${index}.${extension}`;

  if (Platform.OS === 'web') {
    const blob = await fetch(item.uri).then((response) => response.blob());
    form.append('media[]', blob, name);
    return;
  }

  form.append('media[]', { uri: item.uri, name, type } as unknown as Blob);
}

async function reviewForm(payload: Omit<CreateReviewPayload, 'itemId'>): Promise<FormData> {
  const form = new FormData();
  form.append('deliveryRating', String(payload.deliveryRating));
  form.append('qualityRating', String(payload.qualityRating));
  form.append('conformityRating', String(payload.conformityRating));
  form.append('valueRating', String(payload.valueRating));
  payload.tagIds.forEach((id) => form.append('tagIds[]', String(id)));
  form.append('comment', payload.comment);
  form.append('wouldBuyAgain', payload.wouldBuyAgain ? '1' : '0');
  for (const [index, item] of payload.media.entries()) {
    await appendMedia(form, item, index);
  }
  return form;
}

export async function apiCreateReview(payload: CreateReviewPayload): Promise<ApiReview> {
  const form = await reviewForm(payload);
  form.append('itemId', String(payload.itemId));
  return apiRequest<ApiReview>('reviews', { method: 'POST', body: form, auth: true });
}

export async function apiUpdateReview(reviewId: number, payload: UpdateReviewPayload): Promise<ApiReview> {
  const form = await reviewForm(payload);
  form.append('_method', 'PATCH');
  form.append('mediaConsent', payload.mediaConsent ? '1' : '0');
  payload.keepMediaIds.forEach((id) => form.append('keepMediaIds[]', String(id)));
  return apiRequest<ApiReview>(`reviews/${reviewId}`, { method: 'POST', body: form, auth: true });
}

export async function apiRemoveReviewAuthor(reviewId: number): Promise<void> {
  await apiRequest<null>(`reviews/${reviewId}/author`, { method: 'DELETE', auth: true });
}

export async function apiItemReviews(itemId: string, page: number): Promise<ApiReviewPage> {
  return apiRequest<ApiReviewPage>(`items/${itemId}/reviews?page=${page}`, { auth: true });
}

export async function apiReview(reviewId: number): Promise<ApiReview> {
  return apiRequest<ApiReview>(`reviews/${reviewId}`, { auth: true });
}

export async function apiFeed(tab: FeedTab, page: number): Promise<ApiReviewPage> {
  return apiRequest<ApiReviewPage>(`feed?tab=${tab}&page=${page}`, { auth: true });
}

export async function apiCustomerReviews(customerId: string, page: number): Promise<ApiReviewPage> {
  return apiRequest<ApiReviewPage>(`customers/${customerId}/reviews?page=${page}`, { auth: true });
}

export type ApiVoteResult = ApiVoteTally & { myVote: ApiVote | null };

export async function apiVoteOnReview(reviewId: number, vote: ApiVote | null): Promise<ApiVoteResult> {
  return vote
    ? apiRequest<ApiVoteResult>(`reviews/${reviewId}/reaction`, { method: 'PUT', body: { type: vote }, auth: true })
    : apiRequest<ApiVoteResult>(`reviews/${reviewId}/reaction`, { method: 'DELETE', auth: true });
}
