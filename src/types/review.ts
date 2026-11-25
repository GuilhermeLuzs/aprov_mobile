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

export const REVIEW_CHARACTERISTIC_DESCRIPTION: Record<ReviewCharacteristicKey, string> = {
  entrega: 'Cumpriu o prazo combinado e deixou você informado até o fim.',
  qualidade: 'Capricho, acabamento e durabilidade do resultado.',
  conformidade: 'O que você recebeu bate com o que foi anunciado.',
  custo_beneficio: 'O resultado valeu o preço que você pagou.',
};

export const REVIEW_CHARACTERISTIC_KEYS: ReviewCharacteristicKey[] = [
  'entrega',
  'qualidade',
  'conformidade',
  'custo_beneficio',
];

export type Vote = 'agree' | 'disagree';

export type VoteTally = { agreements: number; disagreements: number };

export interface ReviewCharacteristic {
  key: ReviewCharacteristicKey;
  rating: number;
}

export interface MediaFile {
  id: string;
  kind: 'photo' | 'video';
  previewUri: string;
}

export interface ReviewVersion {
  id: string;
  publishedAt: string;
  characteristics: ReviewCharacteristic[];
  averageRating: number;
  positiveTags: Tag[];
  negativeTags: Tag[];
  media: Media[];
  mediaFiles: MediaFile[];
  comment: string;
  wouldBuyAgain: boolean | null;
}

export interface Review {
  id: string;
  productId: string;
  companyId: string;
  authorId: string;
  createdAt: string;
  editedAt: string | null;
  versions: ReviewVersion[];
  title: string;
  characteristics: ReviewCharacteristic[];
  averageRating: number;
  positiveTags: Tag[];
  negativeTags: Tag[];
  media: Media[];
  mediaFiles: MediaFile[];
  comment: string;
  wouldBuyAgain: boolean | null;
  agreements: number;
  disagreements: number;
  myVote: Vote | null;
  votesByVersion?: VoteTally[];
  comments: Comment[];
  commentCount: number;
  shares: number;
  coinsReward: number;
  xpReward: number;
}
