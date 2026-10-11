import { useSyncExternalStore } from 'react';
import { follows as seededFollows } from '../mocks';
import type { Follow } from '../types';
import { getDeactivatedIds } from './deactivated';

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

function withoutDeactivated(follows: Follow[]): Follow[] {
  const hidden = getDeactivatedIds();
  return follows.filter((f) => !hidden.includes(f.followerId) && !hidden.includes(f.followedId));
}

export function resetFollows(): void {
  state = withoutDeactivated(seededFollows);
  emit();
}

export function dropDeactivatedFollows(): void {
  state = withoutDeactivated(state);
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
