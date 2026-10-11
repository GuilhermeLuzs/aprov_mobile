import { useState } from 'react';
import type { Comment, Review, User } from '../../types';
import { useDeactivatedIds } from '../../store/deactivated';
import {
  addComment,
  addReply,
  commentTotal,
  myVote,
  threadOf,
  toggleVote,
  useInteractions,
  withVote,
  type VoteChoice,
} from '../../store/interactions';
import { findUser, useCurrentUser } from '../../store/session';

export const COMMENT_MAX_LENGTH = 500;

function byRelevance(a: Comment, b: Comment): number {
  return b.agreements - a.agreements || Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export function useReviewComments(review: Review | undefined) {
  const me = useCurrentUser();
  const interactions = useInteractions();
  const hiddenAuthorIds = useDeactivatedIds();
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const authorFor = (id: string): User | undefined => (id === me.id ? me : findUser(id));
  const voteFor = (id: string) => myVote(interactions, me.id, 'comment', id);

  const thread = review
    ? threadOf(interactions, review, hiddenAuthorIds)
        .map((comment) => ({
          ...withVote(comment, voteFor(comment.id)),
          replies: comment.replies.map((reply) => withVote(reply, voteFor(reply.id))),
        }))
        .sort(byRelevance)
    : [];

  const send = () => {
    const text = draft.trim();
    if (!review || text === '') return;
    if (replyingTo) addReply(replyingTo.id, me.id, text);
    else addComment(review.id, me.id, text);
    setDraft('');
    setReplyingTo(null);
  };

  return {
    thread,
    total: commentTotal(thread),
    draft,
    setDraft,
    replyingTo,
    setReplyingTo,
    replyingToName: replyingTo ? authorFor(replyingTo.authorId)?.name ?? 'Usuário' : undefined,
    send,
    authorFor,
    voteFor,
    canVote: (authorId: string) => authorId !== me.id,
    vote: (id: string, choice: VoteChoice) => toggleVote(me.id, 'comment', id, choice),
  };
}
