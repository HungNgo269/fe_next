import type { ApiResponse } from "@/app/share/utils/api-types";
import { clientGetJson, clientPatchJson } from "@/app/share/utils/api";
import type { EditableProfileField, UserProfile } from "../types/profile";

const PROFILE_PATH = "/users/me";

type ProfileResponse =
  | UserProfile
  | { user?: Partial<UserProfile> }
  | { data?: Partial<UserProfile> }
  | {
      id?: unknown;
      name?: unknown;
      email?: unknown;
      gender?: unknown;
      avatar?: unknown;
      avatarUrl?: unknown;
    };

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const extractProfile = (payload: ProfileResponse): UserProfile | null => {
  const record =
    "user" in payload
      ? payload.user
      : "data" in payload
        ? payload.data
        : (payload as Partial<UserProfile>);

  if (!record) {
    return null;
  }

  return {
    id: record.id ? toText(record.id) : undefined,
    name: toText(record.name),
    email: toText(record.email),
    gender: toText(record.gender),
    avatar: toText(
      (record as { avatar?: unknown; avatarUrl?: unknown }).avatar ??
        (record as { avatarUrl?: unknown }).avatarUrl,
    ),
  };
};

export const getCurrentUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const result = await clientGetJson<ProfileResponse>(PROFILE_PATH);
  if (!result.ok) {
    return result;
  }

  const profile = extractProfile(result.data);
  if (!profile) {
    return {
      ok: false,
      error: { messages: ["Invalid profile response from server."] },
    };
  }

  return { ok: true, data: profile };
};

export const updateCurrentUserProfileField = async (
  field: EditableProfileField,
  value: string,
): Promise<ApiResponse<UserProfile | null>> => {
  const nextValue = field === "gender" ? value.trim().toUpperCase() : value.trim();
  const payloadField = field === "avatar" ? "avatarUrl" : field;
  const result = await clientPatchJson<ProfileResponse>(PROFILE_PATH, {
    [payloadField]: nextValue,
  });
  if (!result.ok) {
    return result;
  }

  return { ok: true, data: extractProfile(result.data) };
};
