import type { Post, User } from "./api.types";
import type { UserProfile } from "@/app/feature/profile/types/profile";

export type FeedUserProfile = UserProfile & { id: string };

export type FeedBootstrapData = {
  currentUser: User | null;
  currentUserProfile: FeedUserProfile | null;
  isAuthenticated: boolean;
  posts: Post[];
};

export type StoryData = {
  id: string;
  title: string;
  author: User;
  theme: string;
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
  title: string;
  time: string;
};

export type TrendingTopic = {
  topic: string;
  posts: string;
};

export type { Suggestion } from "@/app/feature/suggestion/types/suggestion.type";
