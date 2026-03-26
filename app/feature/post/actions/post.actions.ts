"use server";

import {
  serverDeleteJson,
  serverPatchJson,
  serverPostForm,
  serverPostJson,
} from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { Comment, Like, Post, Report, Share } from "../types/api.types";

export const createPostAction = async (
  content: string,
  mediaFiles: File[],
): Promise<ApiResponse<Post>> => {
  const formData = new FormData();
  const trimmed = content.trim();

  if (trimmed) {
    formData.append("content", trimmed);
  }

  for (const file of mediaFiles) {
    formData.append("media", file);
  }

  return serverPostForm<Post>("/posts", formData);
};

export const updatePostAction = async (
  postId: string,
  content: string,
): Promise<ApiResponse<Post>> =>
  serverPatchJson<Post>(`/posts/${postId}`, { content: content.trim() });

export const deletePostAction = async (
  postId: string,
): Promise<ApiResponse<null>> => serverDeleteJson(`/posts/${postId}`);

export const createLikeAction = async (
  postId: string,
): Promise<ApiResponse<Like>> => serverPostJson<Like>("/likes", { postId });

export const deleteLikeAction = async (
  postId: string,
): Promise<ApiResponse<null>> => serverDeleteJson(`/likes/post/${postId}`);

export const createCommentAction = async (
  postId: string,
  content: string,
  parentId?: string,
): Promise<ApiResponse<Comment>> =>
  serverPostJson<Comment>("/comments", {
    postId,
    content: content.trim(),
    ...(parentId ? { parentId } : {}),
  });

export const updateCommentAction = async (
  commentId: string,
  content: string,
): Promise<ApiResponse<Comment>> =>
  serverPatchJson<Comment>(`/comments/${commentId}`, {
    content: content.trim(),
  });

export const deleteCommentAction = async (
  commentId: string,
): Promise<ApiResponse<null>> => serverDeleteJson(`/comments/${commentId}`);

export const createShareAction = async (
  postId: string,
): Promise<ApiResponse<Share>> => serverPostJson<Share>("/shares", { postId });

export const createPostReportAction = async (
  postId: string,
  text?: string,
): Promise<ApiResponse<Report>> =>
  serverPostJson<Report>("/reports", {
    postId,
    ...(text ? { text } : {}),
  });

export const createCommentReportAction = async (
  commentId: string,
  text?: string,
): Promise<ApiResponse<Report>> =>
  serverPostJson<Report>("/reports", {
    commentId,
    ...(text ? { text } : {}),
  });
