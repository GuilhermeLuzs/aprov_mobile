import type { Category } from './company';
import type { Media } from './media';

export type ProductKind = 'product' | 'service';

export const PRODUCT_KIND_LABEL: Record<ProductKind, string> = {
  product: 'Produto',
  service: 'Serviço',
};

export interface Product {
  id: string;
  companyId: string;
  kind: ProductKind;
  categories: Category[];
  title: string;
  description: string;
  imageUri: string;
  media: Media[];
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
