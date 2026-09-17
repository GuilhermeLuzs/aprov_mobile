export type UserGoal = 'discover' | 'share' | 'earn';

export interface Badge {
  id: string;
  label: string;
  description: string;
  iconUri: string;
  earnedAt: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUri: string;
  bio: string;
  level: number;
  xp: number;
  xpLevelFloor: number;
  xpLevelCeiling: number;
  badges: Badge[];
  reviewCount: number;
  agreementsReceived: number;
  followerCount: number;
  followingCount: number;
  followedByCurrentUser: boolean;
  joinedAt: string;
}
