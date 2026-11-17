import type { ReviewCharacteristicKey } from './review';
import type { Category } from './company';

export type TagSentiment = 'positive' | 'negative';

export interface Tag {
  id: string;
  label: string;
  sentiment: TagSentiment;
  characteristic: ReviewCharacteristicKey;
  kind: 'product' | 'service' | null;
  category: Category | null;
  oppositeId: string | null;
  general: boolean;
}
