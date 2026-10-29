export type DraftRewardFacts = {
  completed: boolean;
  tagCount: number;
  hasVideo: boolean;
  photoCount: number;
  commentLength: number;
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
