import {
  clientGetJson,
} from "@/app/share/utils/api";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { PostComment } from "../types/api.types";

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
