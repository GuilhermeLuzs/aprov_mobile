import { useSyncExternalStore } from 'react';
import type { Comment, CommentReply, Review } from '../types';
import { useDeactivatedIds } from './deactivated';
import { reportedIds, useReports } from './reports';

export type VoteChoice = 'agree' | 'disagree';
export type VoteTarget = 'review' | 'comment';

type CommentEdit = { text: string; editedAt: string; previousTexts: string[] };

type Interactions = {
  votes: Record<string, Record<string, VoteChoice>>;
  votedAt: Record<string, Record<string, string>>;
  comments: Record<string, Comment[]>;
  replies: Record<string, CommentReply[]>;
  edits: Record<string, CommentEdit>;
  deletedIds: string[];
};

let state: Interactions = {
  votes: {},
  votedAt: {},
  comments: {},
  replies: {},
  edits: {},
  deletedIds: [],
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

const voteKey = (target: VoteTarget, id: string) => `${target}:${id}`;

export function toggleVote(userId: string, target: VoteTarget, id: string, choice: VoteChoice): void {
  const mine = { ...(state.votes[userId] ?? {}) };
  const mineAt = { ...(state.votedAt[userId] ?? {}) };
  const key = voteKey(target, id);
  if (mine[key] === choice) {
    delete mine[key];
    delete mineAt[key];
  } else {
    mine[key] = choice;
    mineAt[key] = new Date().toISOString();
  }
  state = {
    ...state,
    votes: { ...state.votes, [userId]: mine },
    votedAt: { ...state.votedAt, [userId]: mineAt },
  };
  emit();
}

export function editComment(id: string, currentText: string, text: string): void {
  const previous = state.edits[id];
  state = {
    ...state,
    edits: {
      ...state.edits,
      [id]: {
        text: text.trim(),
        editedAt: new Date().toISOString(),
        previousTexts: [...(previous?.previousTexts ?? []), currentText],
      },
    },
  };
  emit();
}

export function deleteComment(id: string): void {
  if (state.deletedIds.includes(id)) return;
  state = { ...state, deletedIds: [...state.deletedIds, id] };
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

export function threadOf(
  interactions: Interactions,
  review: Review,
  hiddenAuthorIds: string[],
  hiddenEntryIds: string[],
): Comment[] {
  const removed = (entry: { id: string; authorId: string }) =>
    hiddenAuthorIds.includes(entry.authorId) || interactions.deletedIds.includes(entry.id);
  const withEdit = <T extends Comment | CommentReply>(entry: T): T => {
    const edit = interactions.edits[entry.id];
    return edit ? { ...entry, text: edit.text, editedAt: edit.editedAt } : entry;
  };
  return [...review.comments, ...(interactions.comments[review.id] ?? [])]
    .filter((comment) => !hiddenEntryIds.includes(comment.id))
    .map((comment) => {
      const replies = [...comment.replies, ...(interactions.replies[comment.id] ?? [])]
        .filter((reply) => !hiddenEntryIds.includes(reply.id) && !removed(reply))
        .map(withEdit);
      const shown = { ...withEdit(comment), replies };
      return removed(comment) ? { ...shown, text: '', deleted: true } : shown;
    })
    .filter((comment) => !comment.deleted || comment.replies.length > 0);
}

export function commentTotal(thread: Comment[]): number {
  return thread.reduce((sum, comment) => sum + (comment.deleted ? 0 : 1) + comment.replies.length, 0);
}

export type VoteTally = { agreements: number; disagreements: number };

export function votesAroundEdit(
  interactions: Interactions,
  userId: string,
  review: Review,
): { before: VoteTally; after: VoteTally } | null {
  if (!review.editedAt) return null;
  const before = { agreements: review.agreements, disagreements: review.disagreements };
  const after = { agreements: 0, disagreements: 0 };
  const key = voteKey('review', review.id);
  const vote = interactions.votes[userId]?.[key];
  const votedAt = interactions.votedAt[userId]?.[key];
  if (vote && votedAt) {
    const side = Date.parse(votedAt) >= Date.parse(review.editedAt) ? after : before;
    if (vote === 'agree') side.agreements += 1;
    else side.disagreements += 1;
  }
  return { before, after };
}

export type ReviewDisplay = {
  review: Review;
  vote: VoteChoice | null;
  onVote?: (choice: VoteChoice) => void;
};

export function useReviewDisplay(userId: string): (review: Review) => ReviewDisplay {
  const interactions = useInteractions();
  const hidden = useDeactivatedIds();
  const reportedComments = reportedIds(useReports(), userId, 'comment');
  return (review: Review) => {
    const vote = myVote(interactions, userId, 'review', review.id);
    const thread = threadOf(interactions, review, hidden, reportedComments);
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
