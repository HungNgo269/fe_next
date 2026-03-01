import type { Post } from "@/app/feature/post/types/api.types";

/** Actual shape returned by the backend for GET/PATCH /users/me */
export type ProfileResponse = {
  id: string;
  handle?: string | null;
  name: string;
  email: string;
  gender: string;
  avatarUrl: string | null;
};

export type ProfileFeedResponse = {
  user: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    gender: string;
    avatarUrl: string | null;
  };
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};
