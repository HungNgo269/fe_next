import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { FriendRequestUser, UserListUser } from "../types/user-list.types";

export const fetchFollowersServer = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> =>
  serverGetJson<UserListUser[]>(`/follows/${userId}/followers`);

export const fetchFollowingServer = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> =>
  serverGetJson<UserListUser[]>(`/follows/${userId}/following`);

export const fetchFriendsServer = async (
  userId: string,
): Promise<ApiResponse<UserListUser[]>> =>
  serverGetJson<UserListUser[]>(`/friends/${userId}`);

export const fetchFriendRequestsServer = async (): Promise<
  ApiResponse<FriendRequestUser[]>
> => serverGetJson<FriendRequestUser[]>(`/friends/requests/pending`);
