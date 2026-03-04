import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
  clientPatchJson,
  clientPostJson,
  clientDeleteJson,
} from "@/app/share/utils/api";

import type { Post } from "../types/api.types";

export const fetchPosts = async (): Promise<ApiResponse<Post[]>> =>
  clientGetJson<Post[]>("/posts");

export const createPostRequest = async (
  content: string,
  authorId: string,
): Promise<ApiResponse<Post>> =>
  clientPostJson<Post>("/posts", { content: content.trim(), authorId });

export const updatePostRequest = async (
  postId: string,
  content: string,
): Promise<ApiResponse<Post>> =>
  clientPatchJson<Post>(`/posts/${postId}`, { content: content.trim() });

export const deletePostRequest = async (
  postId: string,
): Promise<ApiResponse<null>> => clientDeleteJson(`/posts/${postId}`);
