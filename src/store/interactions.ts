import { useSyncExternalStore } from 'react';
import type { Comment, CommentReply, Review } from '../types';

export type VoteChoice = 'agree' | 'disagree';
export type VoteTarget = 'review' | 'comment';

type Interactions = {
  votes: Record<string, Record<string, VoteChoice>>;
  comments: Record<string, Comment[]>;
  replies: Record<string, CommentReply[]>;
};

let state: Interactions = { votes: {}, comments: {}, replies: {} };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

const voteKey = (target: VoteTarget, id: string) => `${target}:${id}`;

export function toggleVote(userId: string, target: VoteTarget, id: string, choice: VoteChoice): void {
  const mine = { ...(state.votes[userId] ?? {}) };
  const key = voteKey(target, id);
  if (mine[key] === choice) delete mine[key];
  else mine[key] = choice;
  state = { ...state, votes: { ...state.votes, [userId]: mine } };
  emit();
}

export function addComment(reviewId: string, authorId: string, text: string): void {
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    reviewId,
    authorId,
    createdAt: new Date().toISOString(),
    text: text.trim(),
    agreements: 0,
    disagreements: 0,
    replies: [],
  };
  state = {
    ...state,
    comments: { ...state.comments, [reviewId]: [...(state.comments[reviewId] ?? []), comment] },
  };
  emit();
}

export function addReply(parentId: string, authorId: string, text: string): void {
  const reply: CommentReply = {
    id: `reply-${Date.now()}`,
    parentId,
    authorId,
    createdAt: new Date().toISOString(),
    text: text.trim(),
    agreements: 0,
    disagreements: 0,
  };
  state = {
    ...state,
    replies: { ...state.replies, [parentId]: [...(state.replies[parentId] ?? []), reply] },
  };
  emit();
}

function getInteractions(): Interactions {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useInteractions(): Interactions {
  return useSyncExternalStore(subscribe, getInteractions, getInteractions);
}

export function myVote(
  interactions: Interactions,
  userId: string,
  target: VoteTarget,
  id: string,
): VoteChoice | null {
  return interactions.votes[userId]?.[voteKey(target, id)] ?? null;
}

export function withVote<T extends { agreements: number; disagreements: number }>(
  item: T,
  vote: VoteChoice | null,
): T {
  return {
    ...item,
    agreements: item.agreements + (vote === 'agree' ? 1 : 0),
    disagreements: item.disagreements + (vote === 'disagree' ? 1 : 0),
  };
}

export function threadOf(interactions: Interactions, review: Review): Comment[] {
  return [...review.comments, ...(interactions.comments[review.id] ?? [])].map((comment) => ({
    ...comment,
    replies: [...comment.replies, ...(interactions.replies[comment.id] ?? [])],
  }));
}

export function commentTotal(thread: Comment[]): number {
  return thread.reduce((sum, comment) => sum + 1 + comment.replies.length, 0);
}

export type ReviewDisplay = {
  review: Review;
  vote: VoteChoice | null;
  onVote?: (choice: VoteChoice) => void;
};

export function useReviewDisplay(userId: string): (review: Review) => ReviewDisplay {
  const interactions = useInteractions();
  return (review: Review) => {
    const vote = myVote(interactions, userId, 'review', review.id);
    const thread = threadOf(interactions, review);
    return {
      review: { ...withVote(review, vote), commentCount: commentTotal(thread) },
      vote,
      onVote:
        review.authorId === userId
          ? undefined
          : (choice: VoteChoice) => toggleVote(userId, 'review', review.id, choice),
    };
  };
}
