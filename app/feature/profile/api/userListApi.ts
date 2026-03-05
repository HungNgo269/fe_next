import { clientGetJson } from "@/app/share/utils/api";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { UserListUser } from "../types/user-list.types";

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
