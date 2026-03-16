import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { FeedBootstrapData } from "../types/feed";
import type {
  FeedPagination,
  PaginatedPostsResponse,
  Post,
  User,
} from "@/app/feature/post/types/api.types";
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

const EMPTY_FEED_PAGINATION: FeedPagination = {
  page: 1,
  limit: FEED_PAGE_SIZE,
  hasMore: false,
  totalPosts: 0,
};

export type FeedPostsSsrData = {
  currentUser: User | null;
  feedError: string;
  posts: Post[];
  pagination: FeedPagination;
};

export type FeedPostsOnlySsrData = {
  feedError: string;
  posts: Post[];
  pagination: FeedPagination;
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
          followersCount: 0,
          followingCount: 0,
          isFollowing: false,
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

export const fetchFeedPostsSsr = async (): Promise<FeedPostsSsrData> => {
  const [userResult, postsResult] = await Promise.all([
    serverGetJson<User>("/users/me"),
    serverGetJson<PaginatedPostsResponse>(`/posts?page=1&limit=${FEED_PAGE_SIZE}`, {
      cache: "no-store",
    }),
  ]);

  const currentUser = userResult.ok ? userResult.data : null;

  if (!postsResult.ok) {
    return {
      currentUser,
      feedError: postsResult.error.messages[0] ?? "Unable to load feed.",
      posts: [],
      pagination: EMPTY_FEED_PAGINATION,
    };
  }

  return {
    currentUser,
    feedError: "",
    posts: postsResult.data.posts,
    pagination: postsResult.data.pagination,
  };
};

export const fetchCurrentUserServer = async (): Promise<User | null> => {
  const userResult = await serverGetJson<User>("/users/me", {
    cache: "no-store",
  });
  return userResult.ok ? userResult.data : null;
};

export const fetchFeedPostsOnlySsr = async (): Promise<FeedPostsOnlySsrData> => {
  const postsResult = await serverGetJson<PaginatedPostsResponse>(
    `/posts?page=1&limit=${FEED_PAGE_SIZE}`,
    {
      cache: "no-store",
    },
  );

  if (!postsResult.ok) {
    return {
      feedError: postsResult.error.messages[0] ?? "Unable to load feed.",
      posts: [],
      pagination: EMPTY_FEED_PAGINATION,
    };
  }

  return {
    feedError: "",
    posts: postsResult.data.posts,
    pagination: postsResult.data.pagination,
  };
};
