import {
  clientGetJson,
  clientDeleteJson,
  clientPatchJson,
  clientPostJson,
} from "@/app/share/utils/api";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { Comment, PostComment } from "../types/api.types";

export const createCommentRequest = async (
  postId: string,
  content: string,
  parentId?: string,
): Promise<ApiResponse<Comment>> =>
  clientPostJson<Comment>("/comments", {
    postId,
    content: content.trim(),
    ...(parentId ? { parentId } : {}),
  });

export const updateCommentRequest = async (
  commentId: string,
  content: string,
): Promise<ApiResponse<Comment>> =>
  clientPatchJson<Comment>(`/comments/${commentId}`, {
    content: content.trim(),
  });

export const deleteCommentRequest = async (
  commentId: string,
): Promise<ApiResponse<null>> => clientDeleteJson(`/comments/${commentId}`);

export const fetchCommentsByPostId = async (
  postId: string,
  includeReplies = true,
): Promise<ApiResponse<PostComment[]>> =>
  clientGetJson<PostComment[]>(
    `/comments?postId=${postId}${includeReplies ? "&includeReplies=true" : ""}`,
  );

export const fetchRepliesByCommentId = async (
  commentId: string,
  skip: number,
  take: number,
): Promise<ApiResponse<PostComment[]>> =>
  clientGetJson<PostComment[]>(
    `/comments?parentId=${commentId}&skip=${skip}&take=${take}`,
  );
