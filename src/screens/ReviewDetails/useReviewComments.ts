import { useState } from 'react';
import type { Comment, CommentReply, Review, User } from '../../types';
import { useDeactivatedIds } from '../../store/deactivated';
import {
  addComment,
  addReply,
  commentTotal,
  deleteComment,
  editComment,
  myVote,
  threadOf,
  toggleVote,
  useInteractions,
  withVote,
  type VoteChoice,
} from '../../store/interactions';
import { reportedIds, useReports } from '../../store/reports';
import { findUser, useCurrentUser } from '../../store/session';

export const COMMENT_MAX_LENGTH = 500;

function byRelevance(a: Comment, b: Comment): number {
  return b.agreements - a.agreements || Date.parse(b.createdAt) - Date.parse(a.createdAt);
}

export function useReviewComments(review: Review | undefined) {
  const me = useCurrentUser();
  const interactions = useInteractions();
  const hiddenAuthorIds = useDeactivatedIds();
  const reportedComments = reportedIds(useReports(), me.id, 'comment');
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editing, setEditing] = useState<Comment | CommentReply | null>(null);

  const authorFor = (id: string): User | undefined => (id === me.id ? me : findUser(id));
  const voteFor = (id: string) => myVote(interactions, me.id, 'comment', id);

  const thread = review
    ? threadOf(interactions, review, hiddenAuthorIds, reportedComments)
        .map((comment) => ({
          ...withVote(comment, voteFor(comment.id)),
          replies: comment.replies.map((reply) => withVote(reply, voteFor(reply.id))),
        }))
        .sort(byRelevance)
    : [];

  const send = () => {
    const text = draft.trim();
    if (!review || text === '') return;
    if (editing) {
      if (text !== editing.text) editComment(editing.id, editing.text, text);
      setEditing(null);
      setDraft('');
      return;
    }
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
    setReplyingTo: (comment: Comment | null) => {
      setEditing(null);
      setReplyingTo(comment);
    },
    editing: editing !== null,
    startEditing: (entry: Comment | CommentReply) => {
      setReplyingTo(null);
      setEditing(entry);
      setDraft(entry.text);
    },
    cancelEditing: () => {
      setEditing(null);
      setDraft('');
    },
    remove: (entry: Comment | CommentReply) => {
      if (editing?.id === entry.id) {
        setEditing(null);
        setDraft('');
      }
      deleteComment(entry.id);
    },
    canManage: (authorId: string) => authorId === me.id,
    replyingToName: replyingTo ? authorFor(replyingTo.authorId)?.name ?? 'Usuário' : undefined,
    send,
    authorFor,
    voteFor,
    canVote: (authorId: string) => authorId !== me.id,
    vote: (id: string, choice: VoteChoice) => toggleVote(me.id, 'comment', id, choice),
  };
}
