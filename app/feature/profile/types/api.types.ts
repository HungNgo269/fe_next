import type { Post } from "@/app/feature/post/types/api.types";

export type FriendshipStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";

export type ProfileResponse = {
  id: string;
  handle?: string | null;
  name: string;
  email: string;
  gender: string;
  avatarUrl: string | null;
  bio?: string | null;
  friendsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  friendshipStatus?: FriendshipStatus;
};

export type ProfileFeedResponse = {
  user: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    gender: string;
    avatarUrl: string | null;
    bio?: string | null;
    friendsCount: number;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    friendshipStatus: FriendshipStatus;
  };
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};
