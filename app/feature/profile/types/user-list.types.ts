export type UserListUser = {
  id: string;
  handle: string | null;
  name: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export type FriendRequestUser = {
  id: string;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
  direction: "incoming" | "outgoing";
  requestId: string;
};

export type UserListType = "followers" | "following" | "friends";
