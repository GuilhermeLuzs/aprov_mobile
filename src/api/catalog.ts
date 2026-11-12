import type { Category, CoinIcon, EarnedRewards, ProductKind, TagSentiment } from '../types';
import type { ReviewCharacteristicKey } from '../types';
import { apiRequest } from './client';

export type ApiCompany = {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  categories: Category[];
  coin: { name: string | null; icon: CoinIcon | null; color: string | null } | null;
  itemCount: number;
  reviewCount: number;
  averageRating: number;
  followerCount: number;
};

export type ApiCompanySummary = {
  id: number;
  name: string;
  logoUrl: string | null;
  coin?: ApiCompany['coin'];
};

export type ApiItemMedia = {
  id: number;
  type: 'photo' | 'video';
  url: string;
  coverUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
};

export type ApiItem = {
  id: number;
  companyId: number;
  kind: ProductKind;
  categories: Category[];
  title: string;
  description: string | null;
  averageRating: number;
  reviewCount: number;
  media: ApiItemMedia[];
  maxRewards: EarnedRewards;
  saved?: boolean;
  purchased?: boolean;
};

export type ApiItemDetail = ApiItem & { company: ApiCompanySummary };

export type ApiItemCard = {
  id: number;
  companyId: number;
  kind: ProductKind;
  categories: Category[];
  title: string;
  coverUrl: string | null;
  averageRating: number;
  reviewCount: number;
  maxRewards: EarnedRewards;
  saved?: boolean;
  purchased?: boolean;
};

export type ApiPage = { page: number; pageCount: number };

export type ApiHome = ApiPage & {
  companies: { id: number; name: string; logoUrl: string | null; items: ApiItemCard[] }[];
};

export type HomeQuery = { page: number; search: string; companyIds: string[] };

export type ApiTag = {
  id: number;
  label: string;
  sentiment: TagSentiment;
  characteristic: ReviewCharacteristicKey;
  categories: Category[];
};

export async function apiCompanies(): Promise<ApiCompany[]> {
  return apiRequest<ApiCompany[]>('companies');
}

export async function apiItems(): Promise<ApiItem[]> {
  return apiRequest<ApiItem[]>('items');
}

export async function apiTags(): Promise<ApiTag[]> {
  return apiRequest<ApiTag[]>('tags');
}

export async function apiHome({ page, search, companyIds }: HomeQuery): Promise<ApiHome> {
  const query = new URLSearchParams({ page: String(page) });
  if (search.trim() !== '') query.set('search', search.trim());
  if (companyIds.length > 0) query.set('companies', companyIds.join(','));
  return apiRequest<ApiHome>(`home?${query.toString()}`, { auth: true });
}

export async function apiItem(itemId: string): Promise<ApiItemDetail> {
  return apiRequest<ApiItemDetail>(`items/${itemId}`, { auth: true });
}

export async function apiItemTags(itemId: string): Promise<ApiTag[]> {
  return apiRequest<ApiTag[]>(`items/${itemId}/tags`);
}

export async function apiCompany(companyId: string): Promise<ApiCompany> {
  return apiRequest<ApiCompany>(`companies/${companyId}`);
}

export type CompanyItemsQuery = {
  page: number;
  search: string;
  kinds: ProductKind[];
  categories: Category[];
};

export type ApiCompanyItems = ApiPage & { total: number; items: ApiItemCard[] };

export async function apiCompanyItems(companyId: string, filters: CompanyItemsQuery): Promise<ApiCompanyItems> {
  const query = new URLSearchParams({ page: String(filters.page) });
  if (filters.search.trim() !== '') query.set('search', filters.search.trim());
  if (filters.kinds.length > 0) query.set('kinds', filters.kinds.join(','));
  if (filters.categories.length > 0) query.set('categories', filters.categories.join(','));
  return apiRequest<ApiCompanyItems>(`companies/${companyId}/items?${query.toString()}`, { auth: true });
}
