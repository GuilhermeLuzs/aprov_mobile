import type { Media } from './media';
import type { Tag } from './tag';
import type { Comment } from './comment';

export type ReviewCharacteristicKey = 'entrega' | 'qualidade' | 'conformidade' | 'custo_beneficio';

export const REVIEW_CHARACTERISTIC_LABEL: Record<ReviewCharacteristicKey, string> = {
  entrega: 'Entrega',
  qualidade: 'Qualidade',
  conformidade: 'Conformidade',
  custo_beneficio: 'Custo-benefício',
};

export interface ReviewCharacteristic {
  key: ReviewCharacteristicKey;
  rating: number;
}

export interface Review {
  id: string;
  productId: string;
  companyId: string;
  authorId: string;
  createdAt: string;
  editedAt: string | null;
  title: string;
  characteristics: ReviewCharacteristic[];
  averageRating: number;
  positiveTags: Tag[];
  negativeTags: Tag[];
  media: Media[];
  comment: string;
  wouldBuyAgain: boolean | null;
  agreements: number;
  disagreements: number;
  comments: Comment[];
  commentCount: number;
  shares: number;
  coinsReward: number;
  xpReward: number;
}
