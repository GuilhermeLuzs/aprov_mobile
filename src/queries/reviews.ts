import { useMemo } from 'react';
import { keepPreviousData, useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import {
  apiCustomerReviews,
  apiFeed,
  apiItemReviews,
  apiReview,
  apiVoteOnReview,
  type ApiReview,
  type ApiReviewPage,
  type FeedTab,
} from '../api';
import { useCurrentUser } from '../store/session';
import type { Company, Product, Review, User, Vote } from '../types';
import { patchReview, queryClient, queryKeys, refreshReviewLists } from './client';
import { authorFromApi, companyFromSummary, productFromReviewItem, reviewFromApi, reviewIdOf } from './mappers';

export type ReviewEntry = {
  review: Review;
  author: User;
  product: Product;
  company: Company | undefined;
};

export type ReviewEntryPage = { page: number; pageCount: number; total: number; entries: ReviewEntry[] };

export type ReviewDisplay = {
  review: Review;
  vote: Vote | null;
  onVote?: (choice: Vote) => void;
};

function useEntryFromApi(): (api: ApiReview) => ReviewEntry {
  const me = useCurrentUser();
  return useMemo(
    () => (api: ApiReview) => {
      const fromApi = authorFromApi(api.author ?? null);
      const author = fromApi.id === me.id ? me : fromApi;
      const item = api.item ?? { id: api.itemId, companyId: 0, kind: 'product' as const, title: '' };
      return {
        review: reviewFromApi(api),
        author,
        product: productFromReviewItem(item),
        company: item.company ? companyFromSummary(item.company) : undefined,
      };
    },
    [me],
  );
}

const STALE = 0;

function seedReviews(page: ApiReviewPage): ApiReviewPage {
  page.reviews.forEach((review) => {
    const key = queryKeys.review(review.id);
    if (queryClient.getQueryData(key) === undefined) queryClient.setQueryData(key, review, { updatedAt: STALE });
  });
  return page;
}

function nextPage(last: { page: number; pageCount: number }): number | undefined {
  return last.page < last.pageCount ? last.page + 1 : undefined;
}

export function useItemReviews(itemId: string, page: number) {
  const toEntry = useEntryFromApi();
  const query = useQuery({
    queryKey: queryKeys.itemReviews(itemId, page),
    queryFn: () => apiItemReviews(itemId, page).then(seedReviews),
    placeholderData: keepPreviousData,
  });
  const data = useMemo<ReviewEntryPage | undefined>(
    () =>
      query.data && {
        page: query.data.page,
        pageCount: query.data.pageCount,
        total: query.data.total,
        entries: query.data.reviews.map(toEntry),
      },
    [query.data, toEntry],
  );
  return { ...query, data };
}

function useReviewPages(queryKey: readonly unknown[], fetchPage: (page: number) => Promise<ApiReviewPage>) {
  const toEntry = useEntryFromApi();
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam).then(seedReviews),
    initialPageParam: 1,
    getNextPageParam: (last: ApiReviewPage) => nextPage(last),
  });
  const entries = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.reviews.map(toEntry)),
    [query.data, toEntry],
  );
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, entries, total };
}

export function useFeed(tab: FeedTab) {
  return useReviewPages(queryKeys.feed(tab), (page) => apiFeed(tab, page));
}

export function useCustomerReviews(customerId: string) {
  return useReviewPages(queryKeys.customerReviews(customerId), (page) => apiCustomerReviews(customerId, page));
}

export function useReview(reviewId: string | null) {
  const toEntry = useEntryFromApi();
  const id = reviewId === null ? 0 : reviewIdOf(reviewId);
  const query = useQuery({
    queryKey: queryKeys.review(id),
    queryFn: () => apiReview(id),
    enabled: reviewId !== null,
  });
  const data = useMemo(() => (query.data ? toEntry(query.data) : undefined), [query.data, toEntry]);
  return { ...query, data };
}

export function useReviewSource(reviewId: string | null) {
  const id = reviewId === null ? 0 : reviewIdOf(reviewId);
  return useQuery({
    queryKey: queryKeys.review(id),
    queryFn: () => apiReview(id),
    enabled: reviewId !== null,
  });
}

export function useReviews(reviewIds: string[]) {
  const toEntry = useEntryFromApi();
  const queries = useQueries({
    queries: reviewIds.map((key) => ({
      queryKey: queryKeys.review(reviewIdOf(key)),
      queryFn: () => apiReview(reviewIdOf(key)),
    })),
  });
  const loading = queries.some((q) => q.isPending);
  const entries = queries
    .map((q) => q.data)
    .filter((api): api is ApiReview => api !== undefined)
    .map(toEntry);
  return { entries, loading };
}

function withVote(review: ApiReview, next: Vote | null): ApiReview {
  const previous = review.myVote ?? null;
  const shift = (vote: Vote) => (next === vote ? 1 : 0) - (previous === vote ? 1 : 0);
  return {
    ...review,
    myVote: next,
    agreements: (review.agreements ?? 0) + shift('agree'),
    disagreements: (review.disagreements ?? 0) + shift('disagree'),
  };
}

async function voteOnReview(review: Review, choice: Vote): Promise<void> {
  const id = reviewIdOf(review.id);
  const next = review.myVote === choice ? null : choice;
  patchReview(id, (api) => withVote(api, next));
  try {
    const result = await apiVoteOnReview(id, next);
    patchReview(id, (api) => ({ ...api, ...result }));
  } catch {
    refreshReviewLists();
  }
}

export function useReviewDisplay(): (review: Review) => ReviewDisplay {
  const me = useCurrentUser();
  return (review: Review) => ({
    review,
    vote: review.myVote,
    onVote: review.authorId === me.id ? undefined : (choice: Vote) => void voteOnReview(review, choice),
  });
}
