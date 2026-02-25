import type { ApiResponse } from "@/app/share/utils/api-types";
import { clientGetJson, clientPatchJson } from "@/app/share/utils/api";
import type { PostData } from "@/app/feature/post/types/feed";
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

const toInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "U";
  }
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
};

const colorFromId = (id: string): string => {
  if (!id) {
    return "avatar-slate";
  }
  const palette = [
    "avatar-blue",
    "avatar-teal",
    "avatar-orange",
    "avatar-green",
    "avatar-indigo",
    "avatar-slate",
    "avatar-purple",
  ];
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[hash % palette.length] ?? "avatar-slate";
};

const toHandle = (name: string, fallback: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return slug || fallback.toLowerCase();
};

const formatRelativeTime = (value?: string): string => {
  if (!value) {
    return "Now";
  }
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) {
    return "Now";
  }
  const deltaMinutes = Math.max(1, Math.floor((Date.now() - ms) / 60000));
  if (deltaMinutes < 60) {
    return `${deltaMinutes}m`;
  }
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h`;
  }
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d`;
};

type BackendProfileFeedResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    gender: string;
    avatarUrl: string | null;
  };
  posts: Array<{
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    likedByMe: boolean;
    author: {
      id: string;
      name: string;
      email: string;
    };
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      author: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};

export type ProfileFeedResult = {
  profile: UserProfile;
  posts: PostData[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};

const mapProfileFeedResponse = (
  payload: BackendProfileFeedResponse,
): ProfileFeedResult => ({
  profile: {
    id: payload.user.id,
    name: payload.user.name,
    email: payload.user.email,
    gender: payload.user.gender,
    avatar: payload.user.avatarUrl ?? "",
  },
  posts: payload.posts.map((post) => {
    const authorFallback = post.author.email.split("@")[0] ?? "user";
    return {
      id: post.id,
      author: {
        id: post.author.id,
        name: post.author.name,
        handle: toHandle(post.author.name, authorFallback),
        initials: toInitials(post.author.name),
        colorClass: colorFromId(post.author.id),
      },
      time: formatRelativeTime(post.createdAt),
      audience: "Public",
      content: post.content,
      likes: post.likesCount,
      shares: 0,
      likedByMe: post.likedByMe,
      comments: post.comments.map((comment) => {
        const fallback = comment.author.email.split("@")[0] ?? "user";
        return {
          id: comment.id,
          author: {
            id: comment.author.id,
            name: comment.author.name,
            handle: toHandle(comment.author.name, fallback),
            initials: toInitials(comment.author.name),
            colorClass: colorFromId(comment.author.id),
          },
          text: comment.content,
          time: formatRelativeTime(comment.createdAt),
        };
      }),
    };
  }),
  pagination: payload.pagination,
});

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

export const getCurrentUserProfileFeed = async (
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResult>> => {
  const result = await clientGetJson<BackendProfileFeedResponse>(
    `/users/me/profile?page=${page}&limit=${limit}`,
  );
  if (!result.ok) {
    return result;
  }
  return { ok: true, data: mapProfileFeedResponse(result.data) };
};

export const getUserProfileFeed = async (
  userId: string,
  page = 1,
  limit = 5,
): Promise<ApiResponse<ProfileFeedResult>> => {
  const result = await clientGetJson<BackendProfileFeedResponse>(
    `/users/${userId}/profile?page=${page}&limit=${limit}`,
  );
  if (!result.ok) {
    return result;
  }
  return { ok: true, data: mapProfileFeedResponse(result.data) };
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

export const updateCurrentUserProfile = async (
  draft: Pick<UserProfile, "name" | "email" | "gender" | "avatar">,
): Promise<ApiResponse<UserProfile | null>> => {
  const payload = {
    name: draft.name.trim(),
    email: draft.email.trim(),
    gender: draft.gender.trim().toUpperCase(),
    avatarUrl: draft.avatar.trim(),
  };

  const result = await clientPatchJson<ProfileResponse>(PROFILE_PATH, payload);
  if (!result.ok) {
    return result;
  }

  return { ok: true, data: extractProfile(result.data) };
};
