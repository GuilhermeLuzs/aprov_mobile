import type { ReviewCharacteristicKey } from './review';
import type { Category } from './company';

export type TagSentiment = 'positive' | 'negative';

export interface Tag {
  id: string;
  label: string;
  sentiment: TagSentiment;
  characteristic: ReviewCharacteristicKey;
  categories: Category[];
}
