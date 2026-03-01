import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
  clientPatchJson,
  clientPostJson,
  clientDeleteJson,
} from "@/app/share/utils/api";

import type {
  Post,
  PostComment,
  User,
  Comment,
  Like,
  Share,
} from "../types/api.types";
import type { FeedUserProfile } from "../types/feed";

export const fetchSuggestedUsers = async (): Promise<ApiResponse<User[]>> =>
  clientGetJson<User[]>("/users");

export const fetchPosts = async (): Promise<ApiResponse<Post[]>> =>
  clientGetJson<Post[]>("/posts");

export const fetchCurrentUser = async (): Promise<
  ApiResponse<{
    currentUser: User | null;
    currentUserProfile: FeedUserProfile | null;
    isAuthenticated: boolean;
  }>
> => {
  const raw = await clientGetJson<User>("/users/me");
  if (!raw.ok) return raw;
  const user = raw.data;
  return {
    ok: true,
    data: {
      currentUser: user,
      currentUserProfile: {
        id: user.id,
        handle: user.handle ?? null,
        name: user.name,
        email: user.email,
        gender: user.gender ?? "",
        avatar: user.avatarUrl ?? "",
      },
      isAuthenticated: true,
    },
  };
};

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

export const deletePostRequest = async (postId: string): Promise<ApiResponse<null>> =>
  clientDeleteJson(`/posts/${postId}`);

export const createCommentRequest = async (
  postId: string,
  authorId: string,
  content: string,
  parentId?: string,
): Promise<ApiResponse<Comment>> =>
  clientPostJson<Comment>("/comments", {
    postId,
    authorId,
    content: content.trim(),
    ...(parentId ? { parentId } : {}),
  });

export const updateCommentRequest = async (
  commentId: string,
  content: string,
): Promise<ApiResponse<Comment>> =>
  clientPatchJson<Comment>(`/comments/${commentId}`, { content: content.trim() });

export const deleteCommentRequest = async (commentId: string): Promise<ApiResponse<null>> =>
  clientDeleteJson(`/comments/${commentId}`);

export const createLikeRequest = async (
  postId: string,
  userId: string,
): Promise<ApiResponse<Like>> =>
  clientPostJson<Like>("/likes", { postId, userId });

export const deleteLikeRequest = async (likeId: string): Promise<ApiResponse<null>> =>
  clientDeleteJson(`/likes/${likeId}`);

export const createShareRequest = async (postId: string): Promise<ApiResponse<Share>> =>
  clientPostJson<Share>("/shares", { postId });

export const fetchCommentsByPostId = async (
  postId: string,
  includeReplies = true,
): Promise<ApiResponse<PostComment[]>> =>
  clientGetJson<PostComment[]>(
    `/comments?postId=${postId}${includeReplies ? "&includeReplies=true" : ""}`,
  );
