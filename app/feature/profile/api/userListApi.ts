import { clientGetJson, clientPostJson, clientDeleteJson, clientPatchJson } from "@/app/share/utils/api";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { FriendRequestUser, UserListUser } from "../types/user-list.types";

export const fetchFollowers = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> => {
  return clientGetJson<UserListUser[]>(`/follows/${userId}/followers`);
};

export const fetchFollowing = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> => {
  return clientGetJson<UserListUser[]>(`/follows/${userId}/following`);
};

export const fetchFriends = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> => {
  return clientGetJson<UserListUser[]>(`/friends/${userId}`);
};

export const fetchFriendRequests = async (): Promise<ApiResponse<FriendRequestUser[]>> => {
  return clientGetJson<FriendRequestUser[]>(`/friends/requests/pending`);
};
