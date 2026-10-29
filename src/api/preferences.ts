import { apiRequest } from './client';
import type { ApiClient } from './auth';

export type SavePreferencesPayload = {
  categories: string[];
  companyIds: string[];
  discoverySource: string;
};

export async function apiSavePreferences(payload: SavePreferencesPayload): Promise<ApiClient> {
  return apiRequest<ApiClient>('me/preferences', { method: 'PUT', body: payload, auth: true });
}
