import type { Follow } from '../types';

function edges(followerId: string, followedIds: string[]): Follow[] {
  return followedIds.map((followedId) => ({ followerId, followedId }));
}

export const follows: Follow[] = [
  ...edges('u1', ['u2', 'u4']),
  ...edges('u2', ['u1', 'u3', 'u4', 'u9']),
  ...edges('u3', ['u4', 'u7', 'u9', 'u10']),
  ...edges('u4', ['u3', 'u5', 'u7', 'u9']),
  ...edges('u5', ['u4', 'u9']),
  ...edges('u6', ['u1', 'u2', 'u4']),
  ...edges('u7', ['u3', 'u4', 'u9']),
  ...edges('u8', ['u4', 'u5']),
  ...edges('u9', ['u3', 'u4', 'u7']),
  ...edges('u10', ['u4', 'u9']),
];
