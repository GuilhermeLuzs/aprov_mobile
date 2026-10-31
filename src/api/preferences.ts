import { apiRequest } from './client';
import type { ApiCustomer } from './auth';

export type SavePreferencesPayload = {
  categories: string[];
  companyIds: number[];
  discoverySource: string;
};

export async function apiSavePreferences(payload: SavePreferencesPayload): Promise<ApiCustomer> {
  return apiRequest<ApiCustomer>('me/preferences', { method: 'PUT', body: payload, auth: true });
}
