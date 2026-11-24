import type { ApiPage } from './catalog';
import { apiRequest } from './client';
import type { ApiReviewAuthor, ApiVote, ApiVoteResult } from './reviews';

export type ApiComment = {
  id: number;
  reviewId: number;
  parentId: number | null;
  author: ApiReviewAuthor | null;
  body: string;
  deleted: boolean;
  agreements: number;
  disagreements: number;
  myVote?: ApiVote | null;
  createdAt: string;
  editedAt: string | null;
  replies?: ApiComment[];
};

export type ApiCommentPage = ApiPage & { total: number; comments: ApiComment[] };

export async function apiComments(reviewId: number, page: number): Promise<ApiCommentPage> {
  return apiRequest<ApiCommentPage>(`reviews/${reviewId}/comments?page=${page}`, { auth: true });
}

export async function apiCreateComment(reviewId: number, body: string, parentId: number | null): Promise<ApiComment> {
  return apiRequest<ApiComment>(`reviews/${reviewId}/comments`, {
    method: 'POST',
    body: { body, parentId },
    auth: true,
  });
}

export async function apiUpdateComment(commentId: number, body: string): Promise<ApiComment> {
  return apiRequest<ApiComment>(`comments/${commentId}`, { method: 'PATCH', body: { body }, auth: true });
}

export async function apiDeleteComment(commentId: number): Promise<void> {
  await apiRequest<null>(`comments/${commentId}`, { method: 'DELETE', auth: true });
}

export async function apiVoteOnComment(commentId: number, vote: ApiVote | null): Promise<ApiVoteResult> {
  return vote
    ? apiRequest<ApiVoteResult>(`comments/${commentId}/reaction`, { method: 'PUT', body: { type: vote }, auth: true })
    : apiRequest<ApiVoteResult>(`comments/${commentId}/reaction`, { method: 'DELETE', auth: true });
}
