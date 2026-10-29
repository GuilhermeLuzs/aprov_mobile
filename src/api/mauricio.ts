import type { DraftRewardFacts } from '../types';
import { apiRequest } from './client';

export type MauricioMessage = { author: 'user' | 'mauricio'; text: string };

export async function apiMauricioChat(
  itemId: number,
  messages: MauricioMessage[],
  draft: DraftRewardFacts
): Promise<string> {
  const response = await apiRequest<{ reply: string }>(`items/${itemId}/mauricio-chat`, {
    method: 'POST',
    body: { messages, draft },
    auth: true,
  });

  return response.reply;
}
