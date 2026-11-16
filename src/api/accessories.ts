import { apiRequest } from './client';

export type ApiAccessory = {
  id: string;
  kind: 'skin' | 'frame';
  asset: string;
  name: string;
  description: string;
  price: number;
  level: number;
  owned: boolean;
};

export type ApiAccessoryState = {
  points: number;
  level: number;
  equippedSkinId: string | null;
  equippedFrameId: string | null;
  accessories: ApiAccessory[];
};

export async function apiAccessories(): Promise<ApiAccessoryState> {
  return apiRequest('accessories');
}

export async function apiBuyAccessory(id: string): Promise<ApiAccessoryState> {
  return apiRequest(`accessories/${id}/buy`, { method: 'POST' });
}

export async function apiEquipAccessory(kind: 'skin' | 'frame', id: string | null): Promise<ApiAccessoryState> {
  return apiRequest('me/equipped', { method: 'PUT', body: { kind, accessoryId: id } });
}
