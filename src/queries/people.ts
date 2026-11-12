import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiFollowList, apiPeople, apiProfile, apiSetFollowing, type ApiProfile, type FollowListKind } from '../api';
import type { User } from '../types';
import { queryClient, queryKeys } from './client';
import { userFromProfile } from './mappers';

export type Person = { user: User; followerCount: number; isFollowing: boolean };

export type Profile = Person & { followingCount: number };

function toPerson(api: ApiProfile): Person {
  return {
    user: userFromProfile(api),
    followerCount: api.followerCount ?? 0,
    isFollowing: api.isFollowing ?? false,
  };
}

function toProfile(api: ApiProfile): Profile {
  return { ...toPerson(api), followingCount: api.followingCount ?? 0 };
}

function nextPage(last: { page: number; pageCount: number }): number | undefined {
  return last.page < last.pageCount ? last.page + 1 : undefined;
}

function usePeoplePages(queryKey: readonly unknown[], fetchPage: (page: number) => ReturnType<typeof apiPeople>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
  const people = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.people.map(toPerson)),
    [query.data],
  );
  return { ...query, people };
}

export function usePeople(search: string) {
  return usePeoplePages(queryKeys.people(search), (page) => apiPeople(search, page));
}

export function useFollowList(customerId: string, kind: FollowListKind) {
  return usePeoplePages(queryKeys.followList(customerId, kind), (page) => apiFollowList(customerId, kind, page));
}

export function useProfile(customerId: string) {
  return useQuery({
    queryKey: queryKeys.profile(customerId),
    queryFn: () => apiProfile(customerId),
    select: toProfile,
  });
}

export async function setFollowing(customerId: string, following: boolean): Promise<void> {
  queryClient.setQueryData(queryKeys.profile(customerId), (data: ApiProfile | undefined) =>
    data && {
      ...data,
      isFollowing: following,
      followerCount: Math.max(0, (data.followerCount ?? 0) + (following ? 1 : -1)),
    },
  );
  try {
    await apiSetFollowing(customerId, following);
  } finally {
    void queryClient.invalidateQueries({ queryKey: queryKeys.profile(customerId) });
    void queryClient.invalidateQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['people'] });
    void queryClient.invalidateQueries({ queryKey: ['follow-list'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.feed('following') });
  }
}
