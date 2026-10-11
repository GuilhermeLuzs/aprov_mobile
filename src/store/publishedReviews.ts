import { useSyncExternalStore } from 'react';
import { reviews } from '../mocks';
import type { Review } from '../types';
import { useDeactivatedIds } from './deactivated';
import { reportedIds, useReports } from './reports';
import { useSession } from './session';

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
  const session = useSession();
  const reported = reportedIds(useReports(), session?.id ?? '', 'review');
  return [...own, ...reviews].filter(
    (r) => !hidden.includes(r.authorId) && !reported.includes(r.id),
  );
}
