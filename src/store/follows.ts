import { useSyncExternalStore } from 'react';
import { follows as seededFollows } from '../mocks';
import type { Follow } from '../types';

let state: Follow[] = seededFollows;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function isFollowing(follows: Follow[], followerId: string, followedId: string): boolean {
  return follows.some((f) => f.followerId === followerId && f.followedId === followedId);
}

export function followersOf(follows: Follow[], userId: string): string[] {
  return follows.filter((f) => f.followedId === userId).map((f) => f.followerId);
}

export function followingOf(follows: Follow[], userId: string): string[] {
  return follows.filter((f) => f.followerId === userId).map((f) => f.followedId);
}

export function follow(followerId: string, followedId: string): void {
  if (followerId === followedId || isFollowing(state, followerId, followedId)) return;
  state = [...state, { followerId, followedId }];
  emit();
}

export function unfollow(followerId: string, followedId: string): void {
  state = state.filter((f) => !(f.followerId === followerId && f.followedId === followedId));
  emit();
}

export function resetFollows(): void {
  state = seededFollows;
  emit();
}

function getFollows(): Follow[] {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFollows(): Follow[] {
  return useSyncExternalStore(subscribe, getFollows, getFollows);
}
