import type { ApiResponse } from "@/app/share/utils/api-types";
import {
  clientGetJson,
  clientPatchJson,
  clientPostJson,
  apiClient,
} from "@/app/share/utils/api";
import type {
  AvatarInfo,
  CommentData,
  PostData,
  SidebarMessagePreview,
  SidebarNotificationItem,
  StoryData,
  Suggestion,
} from "../types/feed";
import type { UserProfile } from "@/app/feature/profile/types/profile";

type FeedUserProfile = UserProfile & { id: string };

type BackendUser = {
  id: string;
  name: string;
  email: string;
  gender?: string;
  avatarUrl?: string | null;
};

type BackendPost = {
  id: string;
  content: string;
  authorId: string;
  mediaUrls?: string[];
  createdAt?: string;
};

type BackendComment = {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt?: string;
};

type BackendLike = {
  id: string;
  postId: string;
  userId: string;
};

type BackendConversation = {
  id: string;
  isGroup: boolean;
  name?: string | null;
  participants?: Array<{ userId: string }>;
  messages?: Array<{ content?: string | null; createdAt?: string }>;
  updatedAt?: string;
};

export type FeedBootstrapData = {
  currentUser: AvatarInfo & { id: string };
  currentUserProfile: FeedUserProfile | null;
  isAuthenticated: boolean;
  posts: PostData[];
  stories: StoryData[];
  suggestions: Suggestion[];
  sidebarMessages: SidebarMessagePreview[];
  sidebarNotifications: SidebarNotificationItem[];
  userLikeByPostId: Record<string, string>;
};

const AVATAR_COLORS = [
  "avatar-blue",
  "avatar-teal",
  "avatar-orange",
  "avatar-green",
  "avatar-indigo",
  "avatar-slate",
  "avatar-purple",
];

const STORY_THEMES = [
  "gradient-theme-teal",
  "gradient-theme-orange",
  "gradient-theme-green",
  "gradient-theme-indigo",
];

const toInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "U";
  }
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
};

const colorFromId = (id: string): string => {
  if (!id) {
    return AVATAR_COLORS[0];
  }
  const hash = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
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

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const extractUser = (payload: unknown): BackendUser | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const wrapped = payload as {
    user?: unknown;
    data?: unknown;
    id?: unknown;
    name?: unknown;
    email?: unknown;
    avatar?: unknown;
    avatarUrl?: unknown;
  };

  const candidate =
    wrapped.user && typeof wrapped.user === "object"
      ? (wrapped.user as Record<string, unknown>)
      : wrapped.data && typeof wrapped.data === "object"
        ? (wrapped.data as Record<string, unknown>)
        : (wrapped as Record<string, unknown>);

  const id = toText(candidate.id);
  const name = toText(candidate.name);
  const email = toText(candidate.email);
  const gender = toText(candidate.gender);
  const avatarUrl = toText(candidate.avatarUrl ?? candidate.avatar) || undefined;

  if (!id || !name || !email) {
    return null;
  }

  return {
    id,
    name,
    email,
    gender,
    avatarUrl,
  };
};

const extractUsers = (payload: unknown): BackendUser[] => {
  if (Array.isArray(payload)) {
    return payload.map(extractUser).filter((user): user is BackendUser => Boolean(user));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const wrapped = payload as { users?: unknown; data?: unknown };
  if (Array.isArray(wrapped.users)) {
    return wrapped.users
      .map(extractUser)
      .filter((user): user is BackendUser => Boolean(user));
  }
  if (Array.isArray(wrapped.data)) {
    return wrapped.data
      .map(extractUser)
      .filter((user): user is BackendUser => Boolean(user));
  }
  return [];
};

const mapUserToAvatar = (user: BackendUser): AvatarInfo & { id: string } => ({
  id: user.id,
  name: user.name,
  handle: toHandle(user.name, user.email.split("@")[0] ?? "user"),
  initials: toInitials(user.name),
  colorClass: colorFromId(user.id),
});

const mapComment = (
  comment: BackendComment,
  usersById: Map<string, AvatarInfo & { id: string }>,
): CommentData => {
  const author =
    usersById.get(comment.authorId) ??
    ({
      id: comment.authorId,
      name: "Unknown",
      handle: "unknown",
      initials: "UN",
      colorClass: "avatar-slate",
    } satisfies AvatarInfo & { id: string });

  return {
    id: comment.id,
    author,
    text: comment.content,
    time: formatRelativeTime(comment.createdAt),
  };
};

const mapPost = (
  post: BackendPost,
  usersById: Map<string, AvatarInfo & { id: string }>,
  commentsByPostId: Map<string, BackendComment[]>,
  likesCountByPostId: Map<string, number>,
  likedByMePostIds: Set<string>,
): PostData => {
  const author =
    usersById.get(post.authorId) ??
    ({
      id: post.authorId,
      name: "Unknown",
      handle: "unknown",
      initials: "UN",
      colorClass: "avatar-slate",
    } satisfies AvatarInfo & { id: string });

  const comments = (commentsByPostId.get(post.id) ?? []).map((comment) =>
    mapComment(comment, usersById),
  );

  return {
    id: post.id,
    author,
    time: formatRelativeTime(post.createdAt),
    audience: "Public",
    content: post.content,
    likes: likesCountByPostId.get(post.id) ?? 0,
    shares: 0,
    likedByMe: likedByMePostIds.has(post.id),
    comments,
  };
};

const safeGet = async <T>(path: string): Promise<T | null> => {
  const result = await clientGetJson<T>(path);
  return result.ok ? result.data : null;
};

export const fetchFeedBootstrap = async (): Promise<ApiResponse<FeedBootstrapData>> => {
  const [meResult, usersResult, postsResult, commentsResult, likesResult] =
    await Promise.all([
      clientGetJson<unknown>("/users/me"),
      clientGetJson<unknown>("/users"),
      clientGetJson<BackendPost[]>("/posts"),
      clientGetJson<BackendComment[]>("/comments"),
      clientGetJson<BackendLike[]>("/likes"),
    ]);

  const me = meResult.ok ? extractUser(meResult.data) : null;
  const isAuthenticated = Boolean(me);
  const users = usersResult.ok ? extractUsers(usersResult.data) : [];
  const posts = postsResult.ok ? postsResult.data : [];
  const comments = commentsResult.ok ? commentsResult.data : [];
  const likes = likesResult.ok ? likesResult.data : [];

  const currentBackendUser: BackendUser = me
    ? me
    : {
        id: "guest-user",
        name: "Guest",
        email: "guest@example.com",
      };

  const currentUser = mapUserToAvatar(currentBackendUser);
  if (isAuthenticated && !users.some((user) => user.id === currentBackendUser.id)) {
    users.unshift(currentBackendUser);
  }
  const avatars = users.map(mapUserToAvatar);
  const usersById = new Map(avatars.map((user) => [user.id, user]));

  const commentsByPostId = new Map<string, BackendComment[]>();
  for (const comment of comments) {
    const bucket = commentsByPostId.get(comment.postId) ?? [];
    bucket.push(comment);
    commentsByPostId.set(comment.postId, bucket);
  }

  const likesCountByPostId = new Map<string, number>();
  const likedByMePostIds = new Set<string>();
  const userLikeByPostId: Record<string, string> = {};
  for (const like of likes) {
    likesCountByPostId.set(
      like.postId,
      (likesCountByPostId.get(like.postId) ?? 0) + 1,
    );
    if (like.userId === currentUser.id) {
      likedByMePostIds.add(like.postId);
      userLikeByPostId[like.postId] = like.id;
    }
  }

  const mappedPosts = posts.map((post) =>
    mapPost(post, usersById, commentsByPostId, likesCountByPostId, likedByMePostIds),
  );

  const stories = avatars.slice(0, 4).map((author, index) => ({
    id: `story-${author.id}`,
    title: `${author.name.split(" ")[0] ?? "Story"} update`,
    author,
    theme: STORY_THEMES[index % STORY_THEMES.length],
  }));

  const suggestions = avatars
    .filter((person) => person.id !== currentUser.id)
    .slice(0, 4)
    .map((person) => ({
      name: person.name,
      handle: person.handle,
      initials: person.initials,
      colorClass: person.colorClass,
      note: "Suggested from your network",
    }));

  const myPostIds = new Set(
    posts
      .filter((post) => post.authorId === currentUser.id)
      .map((post) => post.id),
  );
  const sidebarNotifications = comments
    .filter((comment) => myPostIds.has(comment.postId))
    .slice(0, 6)
    .map((comment) => {
      const authorName = usersById.get(comment.authorId)?.name ?? "Someone";
      return {
        id: `n-${comment.postId}-${comment.id}`,
        title: `${authorName} commented on your post`,
        time: formatRelativeTime(comment.createdAt),
      };
    });

  const conversations = await safeGet<BackendConversation[]>("/conversations?limit=8");
  const sidebarMessages = isAuthenticated
    ? (conversations ?? []).map((conversation) => {
    const latest = conversation.messages?.[0];
    const otherId = conversation.participants?.find(
      (participant) => participant.userId !== currentUser.id,
    )?.userId;
    const fallbackName = conversation.isGroup ? "Group chat" : "Direct message";
    const otherName = otherId ? usersById.get(otherId)?.name : undefined;

    return {
      id: conversation.id,
      name: conversation.name || otherName || fallbackName,
      preview: latest?.content?.trim() || "No messages yet",
      time: formatRelativeTime(latest?.createdAt ?? conversation.updatedAt),
    };
      })
    : [];

  return {
    ok: true,
    data: {
      currentUser,
      currentUserProfile: me
        ? {
            id: me.id,
            name: me.name,
            email: me.email,
            gender: me.gender ?? "",
            avatar: me.avatarUrl ?? "",
          }
        : null,
      isAuthenticated,
      posts: mappedPosts,
      stories,
      suggestions,
      sidebarMessages,
      sidebarNotifications,
      userLikeByPostId,
    },
  };
};

export const createPostRequest = async (
  content: string,
  authorId: string,
): Promise<ApiResponse<BackendPost>> =>
  clientPostJson<BackendPost>("/posts", {
    content: content.trim(),
    authorId,
  });

export const updatePostRequest = async (
  postId: string,
  content: string,
): Promise<ApiResponse<BackendPost>> =>
  clientPatchJson<BackendPost>(`/posts/${postId}`, {
    content: content.trim(),
  });

export const deletePostRequest = async (postId: string): Promise<ApiResponse<null>> => {
  try {
    await apiClient.delete(`posts/${postId}`);
    return { ok: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { ok: false, error: { messages: [message] } };
  }
};

export const createCommentRequest = async (
  postId: string,
  authorId: string,
  content: string,
): Promise<ApiResponse<BackendComment>> =>
  clientPostJson<BackendComment>("/comments", {
    postId,
    authorId,
    content: content.trim(),
  });

export const updateCommentRequest = async (
  commentId: string,
  content: string,
): Promise<ApiResponse<BackendComment>> =>
  clientPatchJson<BackendComment>(`/comments/${commentId}`, {
    content: content.trim(),
  });

export const deleteCommentRequest = async (
  commentId: string,
): Promise<ApiResponse<null>> => {
  try {
    await apiClient.delete(`comments/${commentId}`);
    return { ok: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return { ok: false, error: { messages: [message] } };
  }
};

export const createLikeRequest = async (
  postId: string,
  userId: string,
): Promise<ApiResponse<BackendLike>> =>
  clientPostJson<BackendLike>("/likes", { postId, userId });

export const deleteLikeRequest = async (likeId: string): Promise<ApiResponse<null>> => {
  try {
    await apiClient.delete(`likes/${likeId}`);
    return { ok: true, data: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unlike failed";
    return { ok: false, error: { messages: [message] } };
  }
};
