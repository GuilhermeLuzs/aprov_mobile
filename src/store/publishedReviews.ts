import { useSyncExternalStore } from 'react';
import { reviews } from '../mocks';
import type { Review } from '../types';
import { useDeactivatedIds } from './deactivated';

let published: Review[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function publishReview(review: Review): void {
  published = [review, ...published];
  emit();
}

export function getPublishedReviews(): Review[] {
  return published;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePublishedReviews(): Review[] {
  return useSyncExternalStore(subscribe, getPublishedReviews, getPublishedReviews);
}

export function useAllReviews(): Review[] {
  const own = usePublishedReviews();
  const hidden = useDeactivatedIds();
  return [...own, ...reviews].filter((r) => !hidden.includes(r.authorId));
}
