import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  apiComments,
  apiCreateComment,
  apiDeleteComment,
  apiUpdateComment,
  apiVoteOnComment,
  type ApiComment,
} from '../api';
import type { Comment, CommentReply, User, Vote } from '../types';
import { patchComment, patchReview, queryClient, queryKeys } from './client';
import { authorFromApi, commentFromApi, commentIdOf, reviewIdOf } from './mappers';

function nextPage(last: { page: number; pageCount: number }): number | undefined {
  return last.page < last.pageCount ? last.page + 1 : undefined;
}

export function useComments(reviewKey: string | undefined) {
  const reviewId = reviewKey ? reviewIdOf(reviewKey) : 0;
  const query = useInfiniteQuery({
    queryKey: queryKeys.comments(reviewId),
    queryFn: ({ pageParam }) => apiComments(reviewId, pageParam),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: reviewKey !== undefined,
  });

  const { thread, authors } = useMemo(() => {
    const api = (query.data?.pages ?? []).flatMap((page) => page.comments);
    const byId = new Map<string, User>();
    api.flatMap((c) => [c, ...(c.replies ?? [])]).forEach((c) => {
      const author = authorFromApi(c.author);
      byId.set(author.id, author);
    });
    return { thread: api.map(commentFromApi), authors: byId };
  }, [query.data]);

  return { ...query, thread, authors };
}

function refreshComments(reviewId: number): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.comments(reviewId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.review(reviewId) });
}

function shiftCount(reviewId: number, delta: number): void {
  patchReview(reviewId, (review) => ({ ...review, commentCount: Math.max(0, (review.commentCount ?? 0) + delta) }));
}

export async function createComment(reviewKey: string, body: string, parent: Comment | null): Promise<ApiComment> {
  const reviewId = reviewIdOf(reviewKey);
  const created = await apiCreateComment(reviewId, body, parent ? commentIdOf(parent.id) : null);
  shiftCount(reviewId, 1);
  refreshComments(reviewId);
  return created;
}

export async function updateComment(reviewKey: string, entry: Comment | CommentReply, body: string): Promise<void> {
  const reviewId = reviewIdOf(reviewKey);
  const updated = await apiUpdateComment(commentIdOf(entry.id), body);
  patchComment(reviewId, updated.id, (comment) => ({ ...comment, body: updated.body, editedAt: updated.editedAt }));
}

export async function deleteComment(reviewKey: string, entry: Comment | CommentReply): Promise<void> {
  const reviewId = reviewIdOf(reviewKey);
  await apiDeleteComment(commentIdOf(entry.id));
  shiftCount(reviewId, -1);
  refreshComments(reviewId);
}

function withVote(comment: ApiComment, next: Vote | null): ApiComment {
  const previous = comment.myVote ?? null;
  const shift = (vote: Vote) => (next === vote ? 1 : 0) - (previous === vote ? 1 : 0);
  return {
    ...comment,
    myVote: next,
    agreements: comment.agreements + shift('agree'),
    disagreements: comment.disagreements + shift('disagree'),
  };
}

export async function voteOnComment(reviewKey: string, entry: Comment | CommentReply, choice: Vote): Promise<void> {
  const reviewId = reviewIdOf(reviewKey);
  const id = commentIdOf(entry.id);
  const next = entry.myVote === choice ? null : choice;
  patchComment(reviewId, id, (comment) => withVote(comment, next));
  try {
    const result = await apiVoteOnComment(id, next);
    patchComment(reviewId, id, (comment) => ({ ...comment, ...result }));
  } catch {
    refreshComments(reviewId);
  }
}
