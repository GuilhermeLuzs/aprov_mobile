import type { Category } from './company';

export type ProductKind = 'product' | 'service';

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  product: 'Produto',
  service: 'Serviço',
};

export interface Product {
  id: string;
  companyId: string;
  kind: ProductKind;
  category: Category;
  title: string;
  description: string;
  imageUri: string;
  averageRating: number;
  reviewCount: number;
  agreements: number;
  disagreements: number;
  coinsReward: number;
  xpReward: number;
  savedByCurrentUser: boolean;
  purchasedByCurrentUser: boolean;
  reviewedByCurrentUser: boolean;
}
