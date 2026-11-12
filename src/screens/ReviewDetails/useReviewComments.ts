import { useState } from 'react';
import type { Comment, CommentReply, Review, User, Vote } from '../../types';
import { createComment, deleteComment, updateComment, useComments, voteOnComment } from '../../queries/comments';
import { useCurrentUser } from '../../store/session';

export const COMMENT_MAX_LENGTH = 500;

type Entry = Comment | CommentReply;

export function useReviewComments(review: Review | undefined) {
  const me = useCurrentUser();
  const query = useComments(review?.id);
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [sending, setSending] = useState(false);

  const entries = query.thread.flatMap((comment): Entry[] => [comment, ...comment.replies]);
  const entryById = (id: string) => entries.find((entry) => entry.id === id);
  const authorFor = (id: string): User | undefined => (id === me.id ? me : query.authors.get(id));

  const send = async () => {
    const text = draft.trim();
    if (!review || text === '' || sending) return;
    setSending(true);
    try {
      if (editing) {
        if (text !== editing.text) await updateComment(review.id, editing, text);
        setEditing(null);
      } else {
        await createComment(review.id, text, replyingTo);
        setReplyingTo(null);
      }
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return {
    thread: query.thread,
    total: review?.commentCount ?? 0,
    loading: query.isPending && review !== undefined,
    failed: query.isError,
    retry: () => void query.refetch(),
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    draft,
    setDraft,
    replyingTo,
    setReplyingTo: (comment: Comment | null) => {
      setEditing(null);
      setReplyingTo(comment);
    },
    editing: editing !== null,
    startEditing: (entry: Entry) => {
      setReplyingTo(null);
      setEditing(entry);
      setDraft(entry.text);
    },
    cancelEditing: () => {
      setEditing(null);
      setDraft('');
    },
    remove: (entry: Entry) => {
      if (!review) return;
      if (editing?.id === entry.id) {
        setEditing(null);
        setDraft('');
      }
      void deleteComment(review.id, entry);
    },
    canManage: (authorId: string) => authorId === me.id,
    replyingToName: replyingTo ? authorFor(replyingTo.authorId)?.name ?? 'Usuário' : undefined,
    send: () => void send(),
    authorFor,
    voteFor: (id: string) => entryById(id)?.myVote ?? null,
    canVote: (authorId: string) => authorId !== me.id,
    vote: (id: string, choice: Vote) => {
      const entry = entryById(id);
      if (review && entry) void voteOnComment(review.id, entry, choice);
    },
  };
}
