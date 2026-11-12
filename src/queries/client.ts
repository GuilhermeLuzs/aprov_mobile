import { QueryClient, type QueryKey } from '@tanstack/react-query';
import type {
  ApiComment,
  ApiCompanyItems,
  ApiHome,
  ApiItemCard,
  ApiItemDetail,
  ApiReview,
  CompanyItemsQuery,
  FeedTab,
  FollowListKind,
  HomeQuery,
  ItemStateKind,
} from '../api';

const FRESH_FOR_MS = 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: FRESH_FOR_MS, retry: 1 },
  },
});

export const queryKeys = {
  home: (query: HomeQuery) => ['home', query.page, query.search, query.companyIds] as const,
  allHomePages: ['home'] as const,
  companies: ['companies'] as const,
  company: (companyId: string) => ['company', companyId] as const,
  companyItems: (companyId: string, query: CompanyItemsQuery) =>
    ['company-items', companyId, query.page, query.search, query.kinds, query.categories] as const,
  item: (itemId: string) => ['item', itemId] as const,
  itemTags: (itemId: string) => ['item-tags', itemId] as const,
  itemReviews: (itemId: string, page: number) => ['item-reviews', itemId, page] as const,
  allItemReviews: (itemId: string) => ['item-reviews', itemId] as const,
  review: (reviewId: number) => ['review', reviewId] as const,
  feed: (tab: FeedTab) => ['feed', tab] as const,
  customerReviews: (customerId: string) => ['customer-reviews', customerId] as const,
  comments: (reviewId: number) => ['comments', reviewId] as const,
  people: (search: string) => ['people', search] as const,
  profile: (customerId: string) => ['profile', customerId] as const,
  followList: (customerId: string, kind: FollowListKind) => ['follow-list', customerId, kind] as const,
  myItems: (state: ItemStateKind) => ['my-items', state] as const,
  wallet: ['wallet'] as const,
  me: ['me'] as const,
};

const REVIEW_LISTS = ['review', 'item-reviews', 'feed', 'customer-reviews'];
const ITEM_LISTS = ['home', 'item', 'company-items', 'my-items'];

type Pages<T> = { pages: T[]; pageParams: unknown[] };

function isPages<T>(data: unknown): data is Pages<T> {
  return typeof data === 'object' && data !== null && 'pages' in data;
}

function rootIn(roots: string[]) {
  return ({ queryKey }: { queryKey: QueryKey }) => roots.includes(String(queryKey[0]));
}

function mapReviewData(data: unknown, reviewId: number, change: (review: ApiReview) => ApiReview): unknown {
  if (typeof data !== 'object' || data === null) return data;
  if (isPages(data)) return { ...data, pages: data.pages.map((page) => mapReviewData(page, reviewId, change)) };
  if ('reviews' in data && Array.isArray(data.reviews)) {
    return { ...data, reviews: data.reviews.map((r: ApiReview) => (r.id === reviewId ? change(r) : r)) };
  }
  if ('itemId' in data && 'id' in data) {
    const review = data as ApiReview;
    return review.id === reviewId ? change(review) : review;
  }
  return data;
}

export function patchReview(reviewId: number, change: (review: ApiReview) => ApiReview): void {
  queryClient.setQueriesData({ predicate: rootIn(REVIEW_LISTS) }, (data: unknown) =>
    mapReviewData(data, reviewId, change),
  );
}

type ItemLike = ApiItemCard | ApiItemDetail;

function mapItemData(data: unknown, itemId: number, change: <T extends ItemLike>(item: T) => T): unknown {
  if (typeof data !== 'object' || data === null) return data;
  if (isPages(data)) return { ...data, pages: data.pages.map((page) => mapItemData(page, itemId, change)) };
  if ('companies' in data) {
    const home = data as ApiHome;
    return {
      ...home,
      companies: home.companies.map((company) => ({
        ...company,
        items: company.items.map((item) => (item.id === itemId ? change(item) : item)),
      })),
    };
  }
  if ('items' in data && Array.isArray(data.items)) {
    const list = data as ApiCompanyItems;
    return { ...list, items: list.items.map((item) => (item.id === itemId ? change(item) : item)) };
  }
  if ('title' in data && 'id' in data) {
    const item = data as ItemLike;
    return item.id === itemId ? change(item) : item;
  }
  return data;
}

export function patchItem(itemId: number, change: <T extends ItemLike>(item: T) => T): void {
  queryClient.setQueriesData({ predicate: rootIn(ITEM_LISTS) }, (data: unknown) => mapItemData(data, itemId, change));
}

function mapComment(comment: ApiComment, commentId: number, change: (c: ApiComment) => ApiComment): ApiComment {
  if (comment.id === commentId) return change(comment);
  if (!comment.replies) return comment;
  return { ...comment, replies: comment.replies.map((reply) => mapComment(reply, commentId, change)) };
}

export function patchComment(reviewId: number, commentId: number, change: (comment: ApiComment) => ApiComment): void {
  queryClient.setQueryData(queryKeys.comments(reviewId), (data: unknown) => {
    if (!isPages<{ comments: ApiComment[] }>(data)) return data;
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        comments: page.comments.map((comment) => mapComment(comment, commentId, change)),
      })),
    };
  });
}

export function refreshReviewLists(): void {
  REVIEW_LISTS.forEach((root) => void queryClient.invalidateQueries({ queryKey: [root] }));
}

export function refreshAfterReviewChange(itemId: string, reviewId?: number): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.allHomePages });
  void queryClient.invalidateQueries({ queryKey: queryKeys.item(itemId) });
  void queryClient.invalidateQueries({ queryKey: ['company-items'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.allItemReviews(itemId) });
  void queryClient.invalidateQueries({ queryKey: ['feed'] });
  void queryClient.invalidateQueries({ queryKey: ['customer-reviews'] });
  void queryClient.invalidateQueries({ queryKey: ['profile'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
  if (reviewId !== undefined) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.review(reviewId) });
  }
}
