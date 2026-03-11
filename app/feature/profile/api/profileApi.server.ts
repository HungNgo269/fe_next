import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { ProfileFeedResponse } from "../types/api.types";

export const getCurrentUserProfileFeedServer = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  serverGetJson<ProfileFeedResponse>(`/users/me/profile?page=${page}&limit=${limit}`);

export const getUserProfileFeedServer = async (
  userKey: string,
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResponse>> =>
  serverGetJson<ProfileFeedResponse>(
    `/users/${encodeURIComponent(userKey)}/profile?page=${page}&limit=${limit}`,
  );
