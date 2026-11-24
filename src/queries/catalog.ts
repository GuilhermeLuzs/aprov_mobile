import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  apiCompanies,
  apiCompany,
  apiCompanyItems,
  apiHome,
  apiItem,
  apiItemTags,
  apiMyItems,
  apiSetItemState,
  type ApiCompany,
  type ApiCompanyItems,
  type ApiHome,
  type ApiItemDetail,
  type ApiItemPage,
  type ApiTag,
  type CompanyItemsQuery,
  type HomeQuery,
  type ItemStateKind,
} from '../api';
import type { Company, Product, Tag } from '../types';
import { patchItem, queryClient, queryKeys } from './client';
import { companyFromApi, companyFromSummary, productFromApi, productFromCard, tagFromApi } from './mappers';

export type HomeRow = { company: Company; products: Product[] };

export type HomePage = { page: number; pageCount: number; rows: HomeRow[] };

export type ItemDetail = { product: Product; company: Company };

export type ItemPage = { page: number; pageCount: number; total: number; products: Product[] };

function toHomePage(api: ApiHome): HomePage {
  return {
    page: api.page,
    pageCount: api.pageCount,
    rows: api.companies.map((company) => ({
      company: companyFromSummary(company),
      products: company.items.map(productFromCard),
    })),
  };
}

function toCompanies(api: ApiCompany[]): Company[] {
  return api.map(companyFromApi);
}

function toItemDetail(api: ApiItemDetail): ItemDetail {
  return { product: productFromApi(api), company: companyFromSummary(api.company) };
}

function toItemPage(api: ApiCompanyItems): ItemPage {
  return { page: api.page, pageCount: api.pageCount, total: api.total, products: api.items.map(productFromCard) };
}

function toTags(api: ApiTag[]): Tag[] {
  return api.map(tagFromApi);
}

export function useHome(query: HomeQuery) {
  return useQuery({
    queryKey: queryKeys.home(query),
    queryFn: () => apiHome(query),
    placeholderData: keepPreviousData,
    select: toHomePage,
  });
}

export function useCompanies(enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: apiCompanies,
    select: toCompanies,
    enabled,
  });
}

export function useCompany(companyId: string) {
  return useQuery({
    queryKey: queryKeys.company(companyId),
    queryFn: () => apiCompany(companyId),
    select: companyFromApi,
  });
}

export function useCompanyItems(companyId: string, query: CompanyItemsQuery) {
  return useQuery({
    queryKey: queryKeys.companyItems(companyId, query),
    queryFn: () => apiCompanyItems(companyId, query),
    placeholderData: keepPreviousData,
    select: toItemPage,
  });
}

export function useItem(itemId: string) {
  return useQuery({
    queryKey: queryKeys.item(itemId),
    queryFn: () => apiItem(itemId),
    select: toItemDetail,
  });
}

export function useItemTags(itemId: string) {
  return useQuery({
    queryKey: queryKeys.itemTags(itemId),
    queryFn: () => apiItemTags(itemId),
    select: toTags,
  });
}

function nextPage(last: { page: number; pageCount: number }): number | undefined {
  return last.page < last.pageCount ? last.page + 1 : undefined;
}

function toMyItems(data: { pages: ApiItemPage[] }): { products: Product[]; total: number } {
  return {
    products: data.pages.flatMap((page) => page.items.map(productFromCard)),
    total: data.pages[0]?.total ?? 0,
  };
}

export function useMyItems(state: ItemStateKind, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.myItems(state),
    queryFn: ({ pageParam }) => apiMyItems(state, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    select: toMyItems,
    enabled,
  });
}

const STATE_FIELD = { saved: 'saved', purchased: 'purchased' } as const;

async function setItemState(product: Product, state: ItemStateKind, active: boolean): Promise<void> {
  const itemId = Number(product.id);
  patchItem(itemId, (item) => ({ ...item, [STATE_FIELD[state]]: active }));
  try {
    await apiSetItemState(product.id, state, active);
  } catch {
    patchItem(itemId, (item) => ({ ...item, [STATE_FIELD[state]]: !active }));
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.myItems(state) });
}

export function toggleSaved(product: Product): void {
  void setItemState(product, 'saved', !product.savedByCurrentUser);
}

export function togglePurchased(product: Product): void {
  void setItemState(product, 'purchased', !product.purchasedByCurrentUser);
}
