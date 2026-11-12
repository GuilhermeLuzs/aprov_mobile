import type { ApiPage } from './catalog';
import { apiRequest } from './client';

export type ApiProfile = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  level: number;
  xp: number;
  reviewCount?: number;
  agreementsReceived?: number;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  joinedAt: string;
};

export type ApiPeoplePage = ApiPage & { total: number; people: ApiProfile[] };

export async function apiPeople(search: string, page: number): Promise<ApiPeoplePage> {
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim() !== '') query.set('search', search.trim());
  return apiRequest<ApiPeoplePage>(`customers?${query.toString()}`, { auth: true });
}

export async function apiProfile(customerId: string): Promise<ApiProfile> {
  return apiRequest<ApiProfile>(`customers/${customerId}`, { auth: true });
}

export type FollowListKind = 'followers' | 'following';

export async function apiFollowList(customerId: string, kind: FollowListKind, page: number): Promise<ApiPeoplePage> {
  return apiRequest<ApiPeoplePage>(`customers/${customerId}/${kind}?page=${page}`, { auth: true });
}

export async function apiSetFollowing(customerId: string, following: boolean): Promise<{ isFollowing: boolean }> {
  return apiRequest<{ isFollowing: boolean }>(`customers/${customerId}/follow`, {
    method: following ? 'PUT' : 'DELETE',
    auth: true,
  });
}
