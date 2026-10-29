import type { DraftRewardFacts, RewardPreview } from '../types';
import { apiRequest } from './client';

export async function apiRewardPreview(itemId: number, draft: DraftRewardFacts): Promise<RewardPreview> {
  return apiRequest<RewardPreview>(`items/${itemId}/reward-preview`, {
    method: 'POST',
    body: { draft },
    auth: true,
  });
}
