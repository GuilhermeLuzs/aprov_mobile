import { useQuery } from '@tanstack/react-query';
import { apiMe, apiSavePreferences, type ApiCustomer } from '../api';
import type { Category, DiscoverySource } from '../types';
import { queryClient, queryKeys } from './client';

export type MyInterests = { categories: Category[]; companyIds: string[] };

function toInterests(api: ApiCustomer): MyInterests {
  return {
    categories: (api.preferredCategories ?? []) as Category[],
    companyIds: api.followedCompanyIds.map(String),
  };
}

export function useMyInterests() {
  return useQuery({ queryKey: queryKeys.me, queryFn: apiMe, select: toInterests });
}

export async function saveInterests(interests: MyInterests, discoverySource?: DiscoverySource): Promise<void> {
  const customer = await apiSavePreferences({
    categories: interests.categories,
    companyIds: interests.companyIds.map(Number),
    discoverySource,
  });
  queryClient.setQueryData(queryKeys.me, customer);
  void queryClient.invalidateQueries({ queryKey: queryKeys.allHomePages });
  void queryClient.invalidateQueries({ queryKey: ['feed'] });
}
