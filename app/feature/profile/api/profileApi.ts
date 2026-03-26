import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
} from "@/app/share/utils/api";
import type { UserProfile } from "../types/profile";
import type {
  ProfileResponse,
  ProfileFeedResponse,
} from "../types/api.types";

const PROFILE_PATH = "/users/me";

const mapToUserProfile = (
  data: ProfileResponse | ProfileFeedResponse["user"],
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

export const getUserProfileFeed = async (
  profileKey: string,
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  clientGetJson<ProfileFeedResponse>(
    `/users/${encodeURIComponent(profileKey)}/profile?page=${page}&limit=${limit}`,
  );
