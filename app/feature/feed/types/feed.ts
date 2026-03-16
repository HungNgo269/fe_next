import type { FeedPagination, Post, User } from "@/app/feature/post/types/api.types";
import type { UserProfile } from "@/app/feature/profile/types/profile";

export type FeedUserProfile = UserProfile & { id: string };

export type FeedBootstrapData = {
  currentUser: User | null;
  currentUserProfile: FeedUserProfile | null;
  isAuthenticated: boolean;
  posts: Post[];
  pagination: FeedPagination;
};



export type NavItem = {
  label: string;
  description: string;
};

export type SidebarMessagePreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
};

export type SidebarNotificationItem = {
  id: string;
  type:
    | "LIKE"
    | "COMMENT"
    | "FRIEND_REQUEST"
    | "FRIEND_ACCEPTED"
    | "NEW_FOLLOWER"
    | "NEW_MESSAGE";
  title: string;
  unreadEvents: number;
  uniqueActors: number;
  referenceId: string | null;
  time: string;
};

export type TrendingTopic = {
  topic: string;
  posts: string;
};
