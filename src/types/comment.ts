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
  replies: CommentReply[];
}
