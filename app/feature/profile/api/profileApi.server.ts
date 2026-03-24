import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { ProfileFeedResponse, ProfileResponse } from "../types/api.types";
import type { UserProfile } from "../types/profile";

const mapToUserProfile = (data: ProfileResponse): UserProfile => ({
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

export const getCurrentUserProfileFeedServer = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  serverGetJson<ProfileFeedResponse>(`/users/me/profile?page=${page}&limit=${limit}`);

export const getCurrentUserProfileServer = async (): Promise<
  ApiResponse<UserProfile>
> => {
  const raw = await serverGetJson<ProfileResponse>("/users/me");
  if (!raw.ok) {
    return raw;
  }

  return {
    ok: true,
    data: mapToUserProfile(raw.data),
  };
};

export const getUserProfileFeedServer = async (
  userKey: string,
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  serverGetJson<ProfileFeedResponse>(
    `/users/${encodeURIComponent(userKey)}/profile?page=${page}&limit=${limit}`,
  );
