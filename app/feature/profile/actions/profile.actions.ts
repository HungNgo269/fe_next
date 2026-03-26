"use server";

import { revalidatePath } from "next/cache";
import {
  serverDeleteJson,
  serverPatchJson,
  serverPostForm,
  serverPostJson,
} from "@/app/share/utils/api.server";
import type { FormActionState } from "@/app/share/types/action-state";
import type { ApiResponse } from "@/app/share/utils/api-types";
import type { UserProfile } from "../types/profile";
import type { ProfileFeedResponse, ProfileResponse } from "../types/api.types";

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

export const updateCurrentUserProfileAction = async (
  draft: Pick<UserProfile, "name" | "email" | "gender" | "bio">,
): Promise<ApiResponse<UserProfile>> => {
  const raw = await serverPatchJson<ProfileResponse>(`${PROFILE_PATH}/profile-info`, {
    name: draft.name.trim(),
    email: draft.email.trim(),
    gender: draft.gender.trim().toUpperCase(),
    bio: (draft.bio ?? "").trim(),
  });

  if (!raw.ok) {
    return raw;
  }

  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const uploadCurrentUserAvatarAction = async (
  avatarFile: File,
): Promise<ApiResponse<UserProfile>> => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);

  const raw = await serverPostForm<ProfileResponse>(`${PROFILE_PATH}/avatar`, formData);

  if (!raw.ok) {
    return raw;
  }

  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const deleteCurrentUserAvatarAction = async (): Promise<
  ApiResponse<UserProfile>
> => {
  const raw = await serverDeleteJson<ProfileResponse>(`${PROFILE_PATH}/avatar`);

  if (!raw.ok) {
    return raw;
  }

  return { ok: true, data: mapToUserProfile(raw.data) };
};

export const followUserAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverPostJson(`/follows/${userId}`, {});

export const unfollowUserAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverDeleteJson(`/follows/${userId}`);

export const sendFriendRequestAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverPostJson(`/friends/${userId}/request`, {});

export const cancelFriendRequestAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverDeleteJson(`/friends/${userId}/request`);

export const acceptFriendRequestAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverPatchJson(`/friends/${userId}/accept`, {});

export const declineFriendRequestAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverPatchJson(`/friends/${userId}/decline`, {});

export const removeFriendAction = async (
  userId: string,
): Promise<ApiResponse<void>> => serverDeleteJson(`/friends/${userId}`);

const toFormActionState = (
  response: ApiResponse<unknown>,
): FormActionState => ({
  success: response.ok,
  error: response.ok
    ? null
    : (response.error.messages[0] ?? "Unable to complete this action."),
});

const parseUserIdFromFormData = (formData: FormData) => {
  const rawValue = formData.get("userId");
  return typeof rawValue === "string" ? rawValue : "";
};

const revalidateProfilePage = () => {
  revalidatePath("/profile/[handle]", "page");
};

export const followUserFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await followUserAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const unfollowUserFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await unfollowUserAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const sendFriendRequestFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await sendFriendRequestAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const cancelFriendRequestFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await cancelFriendRequestAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const acceptFriendRequestFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await acceptFriendRequestAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const declineFriendRequestFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await declineFriendRequestAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};

export const removeFriendFormAction = async (
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> => {
  const userId = parseUserIdFromFormData(formData);
  const response = await removeFriendAction(userId);
  revalidateProfilePage();
  return toFormActionState(response);
};
