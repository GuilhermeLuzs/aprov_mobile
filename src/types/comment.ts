import type { Vote } from './review';

export interface CommentReply {
  id: string;
  parentId: string;
  authorId: string;
  createdAt: string;
  text: string;
  editedAt?: string | null;
  deleted?: boolean;
  agreements: number;
  disagreements: number;
  myVote: Vote | null;
}

export interface Comment {
  id: string;
  reviewId: string;
  authorId: string;
  createdAt: string;
  text: string;
  editedAt?: string | null;
  deleted?: boolean;
  agreements: number;
  disagreements: number;
  myVote: Vote | null;
  replies: CommentReply[];
}
