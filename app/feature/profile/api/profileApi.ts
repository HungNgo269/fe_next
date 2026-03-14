import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientDeleteJson,
  clientGetJson,
  clientPatchJson,
  clientPostForm,
  clientPostJson,
} from "@/app/share/utils/api";
import type { UserProfile } from "../types/profile";
import type {
  ProfileResponse,
  ProfileFeedResponse,
} from "../types/api.types";

const PROFILE_PATH = "/users/me";

const mapToUserProfile = (
  data: ProfileResponse | ProfileFeedResponse["user"]
): UserProfile => ({
  id: data.id,
  handle: data.handle ?? null,
  name: data.name,
  email: data.email,
  gender: data.gender,
  avatar: data.avatarUrl ?? "",
  bio: data.bio ?? "",
  followersCount: data.followersCount ?? 0,
  followingCount: data.followingCount ?? 0,
  isFollowing: data.isFollowing ?? false,
});

export const getCurrentUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const raw = await clientGetJson<ProfileResponse>(PROFILE_PATH);
  if (!raw.ok) return raw;
  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const getCurrentUserProfileFeed = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  clientGetJson<ProfileFeedResponse>(`/users/me/profile?page=${page}&limit=${limit}`);

export const getUserProfileFeed = async (
  userId: string,
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  clientGetJson<ProfileFeedResponse>(`/users/${userId}/profile?page=${page}&limit=${limit}`);

export const updateCurrentUserProfile = async (
  draft: Pick<UserProfile, "name" | "email" | "gender" | "bio">,
): Promise<ApiResponse<UserProfile>> => {
  const raw = await clientPatchJson<ProfileResponse>(`${PROFILE_PATH}/profile-info`, {
    name: draft.name.trim(),
    email: draft.email.trim(),
    gender: draft.gender.trim().toUpperCase(),
    bio: (draft.bio ?? "").trim(),
  });
  if (!raw.ok) return raw;
  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const uploadCurrentUserAvatar = async (
  avatarFile: File,
): Promise<ApiResponse<UserProfile>> => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const raw = await clientPostForm<ProfileResponse>(`${PROFILE_PATH}/avatar`, formData);
  if (!raw.ok) return raw;
  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const deleteCurrentUserAvatar = async (): Promise<ApiResponse<UserProfile>> => {
  const raw = await clientDeleteJson<ProfileResponse>(`${PROFILE_PATH}/avatar`);
  if (!raw.ok) return raw;
  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const followUserApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientPostJson(`/follows/${userId}`, {});

export const unfollowUserApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientDeleteJson(`/follows/${userId}`);

export const sendFriendRequestApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientPostJson(`/friends/${userId}/request`, {});

export const cancelFriendRequestApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientDeleteJson(`/friends/${userId}/request`);

export const acceptFriendRequestApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientPatchJson(`/friends/${userId}/accept`, {});

export const declineFriendRequestApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientPatchJson(`/friends/${userId}/decline`, {});

export const removeFriendApi = async (userId: string): Promise<ApiResponse<void>> =>
  clientDeleteJson(`/friends/${userId}`);
