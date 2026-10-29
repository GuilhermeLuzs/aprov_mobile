import { apiRequest } from './client';

export type ReviewMediaUpload = {
  uri: string;
  kind: 'photo' | 'video';
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

export async function apiCreateReview(payload: CreateReviewPayload): Promise<void> {
  const form = new FormData();
  form.append('itemId', String(payload.itemId));
  form.append('deliveryRating', String(payload.deliveryRating));
  form.append('qualityRating', String(payload.qualityRating));
  form.append('conformityRating', String(payload.conformityRating));
  form.append('valueRating', String(payload.valueRating));
  payload.tagIds.forEach((id) => form.append('tagIds[]', String(id)));
  form.append('comment', payload.comment);
  form.append('wouldBuyAgain', payload.wouldBuyAgain ? '1' : '0');
  payload.media.forEach((item, index) => {
    const extension = item.kind === 'video' ? 'mp4' : 'jpg';
    const type = item.kind === 'video' ? 'video/mp4' : 'image/jpeg';
    form.append('media[]', { uri: item.uri, name: `media-${index}.${extension}`, type } as unknown as Blob);
  });

  await apiRequest<unknown>('reviews', { method: 'POST', body: form, auth: true });
}
