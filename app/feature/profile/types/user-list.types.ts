export type UserListUser = {
  id: string;
  handle: string | null;
  name: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type UserListType = "followers" | "following" | "friends";
