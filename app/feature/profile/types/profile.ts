export type UserProfile = {
  id?: string;
  handle?: string | null;
  name: string;
  email: string;
  gender: string;
  avatar: string;
  friendsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
};

export type EditableProfileField = "avatar" | "name" | "email" | "gender";

export type EditableProfileDrafts = Record<EditableProfileField, string>;
