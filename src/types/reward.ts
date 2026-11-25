import type { ReviewCharacteristicKey } from './review';

export type DraftRewardFacts = {
  completed: boolean;
  tagCount: number;
  hasVideo: boolean;
  photoCount: number;
  commentLength: number;
};

export type MauricioDraftContext = DraftRewardFacts & {
  characteristics: Record<ReviewCharacteristicKey, number>;
  positiveTagIds: number[];
  negativeTagIds: number[];
  comment: string;
};

export type RewardTopicStatus = {
  topic: string;
  threshold: number | null;
  satisfied: boolean;
  coins: number;
  aprovPoints: number;
  xp: number;
};

export type EarnedRewards = {
  coins: number;
  aprovPoints: number;
  xp: number;
};

export type RewardPreview = {
  topics: RewardTopicStatus[];
  earned: EarnedRewards;
};
