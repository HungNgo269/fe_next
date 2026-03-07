import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
  clientPatchJson,
  clientPostForm,
  clientDeleteJson,
} from "@/app/share/utils/api";

import type { PaginatedPostsResponse, Post } from "../types/api.types";

export const fetchPosts = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<PaginatedPostsResponse>> =>
  clientGetJson<PaginatedPostsResponse>(`/posts?page=${page}&limit=${limit}`);

export const createPostRequest = async (
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
  return clientPostForm<Post>("/posts", formData);
};

export const updatePostRequest = async (
  postId: string,
  content: string,
): Promise<ApiResponse<Post>> =>
  clientPatchJson<Post>(`/posts/${postId}`, { content: content.trim() });

export const deletePostRequest = async (
  postId: string,
): Promise<ApiResponse<null>> => clientDeleteJson(`/posts/${postId}`);
