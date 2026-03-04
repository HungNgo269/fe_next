import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { FeedBootstrapData } from "../types/feed";
import type { PaginatedPostsResponse, User } from "@/app/feature/post/types/api.types";
import { FEED_PAGE_SIZE } from "@/app/share/hooks/feedQueryKeys";

type CurrentUserPayload = {
  currentUser: User | null;
  currentUserProfile: FeedBootstrapData["currentUserProfile"];
  isAuthenticated: boolean;
};

const GUEST_USER_DATA: CurrentUserPayload = {
  currentUser: null,
  currentUserProfile: null,
  isAuthenticated: false,
};

export const prefetchFeedPosts = async (): Promise<FeedBootstrapData> => {
  const [userResult, postsResult] = await Promise.all([
    serverGetJson<User>("/users/me"),
    serverGetJson<PaginatedPostsResponse>(
      `/posts?page=1&limit=${FEED_PAGE_SIZE}`,
    ),
  ]);

  const userData: CurrentUserPayload = userResult.ok
    ? {
        currentUser: userResult.data,
        currentUserProfile: {
          id: userResult.data.id,
          handle: userResult.data.handle ?? null,
          name: userResult.data.name,
          email: userResult.data.email,
          gender: userResult.data.gender ?? "",
          avatar: userResult.data.avatarUrl ?? "",
        },
        isAuthenticated: true,
      }
    : GUEST_USER_DATA;

  if (!postsResult.ok) {
    throw new Error(postsResult.error.messages[0] ?? "Unable to load feed.");
  }

  return {
    ...userData,
    posts: postsResult.data.posts,
    pagination: postsResult.data.pagination,
  };
};

export const fetchPostsServer = async (
  page = 1,
  limit = FEED_PAGE_SIZE,
): Promise<ApiResponse<PaginatedPostsResponse>> =>
  serverGetJson<PaginatedPostsResponse>(`/posts?page=${page}&limit=${limit}`);
