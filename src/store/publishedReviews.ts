import { useSyncExternalStore } from 'react';
import type { Review } from '../types';

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
