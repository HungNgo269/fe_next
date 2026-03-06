import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
  clientPatchJson,
  clientPostJson,
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
): Promise<ApiResponse<Post>> =>
  clientPostJson<Post>("/posts", { content: content.trim() });

export const createPostWithImagesRequest = async (
  content: string,
  images: File[],
): Promise<ApiResponse<Post>> => {
  const formData = new FormData();
  formData.append("content", content.trim());
  for (const image of images) {
    formData.append("images", image);
  }
  return clientPostForm<Post>("/posts/with-images", formData);
};

export const updatePostRequest = async (
  postId: string,
  content: string,
): Promise<ApiResponse<Post>> =>
  clientPatchJson<Post>(`/posts/${postId}`, { content: content.trim() });

export const deletePostRequest = async (
  postId: string,
): Promise<ApiResponse<null>> => clientDeleteJson(`/posts/${postId}`);
