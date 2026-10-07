import { commentDone, mediaDone, starsDone, tagsDone, type Draft } from './draft';

export const STEP_SHARE = {
  stars: 0.3,
  tags: 0.2,
  media: 0.3,
  comment: 0.2,
} as const;

export type Rewards = { coins: number; points: number; xp: number };

export function earnedShare(draft: Draft): number {
  return (
    (starsDone(draft) ? STEP_SHARE.stars : 0) +
    (tagsDone(draft) ? STEP_SHARE.tags : 0) +
    (mediaDone(draft) ? STEP_SHARE.media : 0) +
    (commentDone(draft) ? STEP_SHARE.comment : 0)
  );
}

export function earnedRewards(draft: Draft, full: Rewards): Rewards {
  const share = earnedShare(draft);
  return {
    coins: Math.round(full.coins * share),
    points: Math.round(full.points * share),
    xp: Math.round(full.xp * share),
  };
}

export function stepBonus(full: number, share: number): number {
  return Math.round(full * share);
}
