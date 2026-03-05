import type { Post } from "@/app/feature/post/types/api.types";

export type ProfileResponse = {
  id: string;
  handle?: string | null;
  name: string;
  email: string;
  gender: string;
  avatarUrl: string | null;
  friendsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};

export type ProfileFeedResponse = {
  user: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    gender: string;
    avatarUrl: string | null;
    friendsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};
