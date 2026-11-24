import type { ApiItemCard, ApiPage } from './catalog';
import { apiRequest } from './client';

export type ItemStateKind = 'saved' | 'purchased';

export type ApiItemPage = ApiPage & { total: number; items: ApiItemCard[] };

export async function apiMyItems(state: ItemStateKind, page: number): Promise<ApiItemPage> {
  return apiRequest<ApiItemPage>(`me/items?state=${state}&page=${page}`, { auth: true });
}

export async function apiSetItemState(itemId: string, state: ItemStateKind, active: boolean): Promise<void> {
  await apiRequest(`me/items/${itemId}/${state}`, { method: active ? 'PUT' : 'DELETE', auth: true });
}
