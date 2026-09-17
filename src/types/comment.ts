export interface CommentReply {
  id: string;
  parentId: string;
  authorId: string;
  createdAt: string;
  text: string;
  agreements: number;
}

export interface Comment {
  id: string;
  reviewId: string;
  authorId: string;
  createdAt: string;
  text: string;
  agreements: number;
  replies: CommentReply[];
}
