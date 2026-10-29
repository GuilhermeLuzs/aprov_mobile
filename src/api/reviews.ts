import { Platform } from 'react-native';
import type { EarnedRewards } from '../types';
import { apiRequest } from './client';

export type ReviewMediaUpload = {
  uri: string;
  kind: 'photo' | 'video';
};

export type ApiReviewTag = { id: number };

export type ApiReviewMedia = { id: number; type: 'photo' | 'video'; url: string };

export type ApiReview = {
  id: number;
  itemId: number;
  deliveryRating: number;
  qualityRating: number;
  conformityRating: number;
  valueRating: number;
  averageRating: number;
  comment: string;
  wouldBuyAgain: boolean;
  positiveTags: ApiReviewTag[];
  negativeTags: ApiReviewTag[];
  media: ApiReviewMedia[];
  rewards?: EarnedRewards;
  createdAt: string;
};

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

export async function apiMyReviews(): Promise<ApiReview[]> {
  return apiRequest<ApiReview[]>('me/reviews', { auth: true });
}

export async function apiCreateReview(payload: CreateReviewPayload): Promise<ApiReview> {
  const form = new FormData();
  form.append('itemId', String(payload.itemId));
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

  return apiRequest<ApiReview>('reviews', { method: 'POST', body: form, auth: true });
}
