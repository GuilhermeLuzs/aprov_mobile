export type LevelProgress = {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number;
};

export function levelProgress(totalXp: number, xpPerLevel: number): LevelProgress {
  const safeXp = Math.max(0, totalXp);
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const xpInLevel = safeXp % xpPerLevel;
  return {
    level,
    xpInLevel,
    xpToNext: xpPerLevel - xpInLevel,
    progress: xpInLevel / xpPerLevel,
  };
}
