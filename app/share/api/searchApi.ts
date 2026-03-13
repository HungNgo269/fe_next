import { clientGetJson } from "@/app/share/utils/api";

export type SidebarSearchUser = {
  id: string;
  name: string;
  handle: string | null;
  username: string | null;
  bio: string | null;
  score: number;
};

export type SidebarSearchPost = {
  id: string;
  content: string;
  authorId: string | null;
  createdAt: string | null;
  score: number;
};

export type SidebarSearchAllResult = {
  users: SidebarSearchUser[];
  posts: SidebarSearchPost[];
  totalUsers: number;
  totalPosts: number;
  tookMs: number;
};

type SearchUsersApiResponse = {
  success?: boolean;
  data?: {
    hits?: Array<{
      id?: string;
      name?: string;
      handle?: string | null;
      username?: string | null;
      bio?: string | null;
      score?: number;
    }>;
  };
};

type SearchAllApiResponse = {
  success?: boolean;
  data?: {
    users?: Array<{
      id?: string;
      name?: string;
      handle?: string | null;
      username?: string | null;
      bio?: string | null;
      score?: number;
    }>;
    posts?: Array<{
      id?: string;
      content?: string;
      authorId?: string | null;
      author_id?: string | null;
      createdAt?: string | null;
      created_at?: string | null;
      score?: number;
    }>;
    total?: {
      users?: number;
      posts?: number;
    };
    took_ms?: number;
  };
};

type SearchOptions = {
  limit?: number;
  signal?: AbortSignal;
};

const SEARCH_LIMIT = 12;
const SEARCH_MAX_LIMIT = 25;

const toSafeLimit = (limit: number) =>
  Math.max(1, Math.min(limit, SEARCH_MAX_LIMIT));

const resolveSearchOptions = (
  limitOrOptions: number | SearchOptions,
): { limit: number; signal?: AbortSignal } => {
  if (typeof limitOrOptions === "number") {
    return { limit: limitOrOptions };
  }

  return {
    limit: limitOrOptions.limit ?? SEARCH_LIMIT,
    signal: limitOrOptions.signal,
  };
};

const normalizeUsers = (
  hits: Array<{
    id?: string;
    name?: string;
    handle?: string | null;
    username?: string | null;
    bio?: string | null;
    score?: number;
  }>,
): SidebarSearchUser[] =>
  hits
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.id))
    .map((item) => ({
      id: item.id!,
      name: item.name?.trim() || "Unknown user",
      handle: item.handle?.trim() || null,
      username: item.username?.trim() || null,
      bio: item.bio?.trim() || null,
      score: item.score ?? 0,
    }));

const normalizePosts = (
  hits: Array<{
    id?: string;
    content?: string;
    authorId?: string | null;
    author_id?: string | null;
    createdAt?: string | null;
    created_at?: string | null;
    score?: number;
  }>,
): SidebarSearchPost[] =>
  hits
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.id))
    .map((item) => ({
      id: item.id!,
      content: item.content?.trim() || "Khong co noi dung",
      authorId: item.authorId ?? item.author_id ?? null,
      createdAt: item.createdAt ?? item.created_at ?? null,
      score: item.score ?? 0,
    }));

export const searchUsers = async (
  query: string,
  limitOrOptions: number | SearchOptions = SEARCH_LIMIT,
): Promise<SidebarSearchUser[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const { limit, signal } = resolveSearchOptions(limitOrOptions);
  const safeLimit = toSafeLimit(limit);
  const response = await clientGetJson<SearchUsersApiResponse>(
    `/search/users?query=${encodeURIComponent(trimmedQuery)}&limit=${safeLimit}`,
    {
      config: signal ? { signal } : undefined,
    },
  );

  if (!response.ok || !response.data.success) {
    return [];
  }

  return normalizeUsers(response.data.data?.hits ?? []);
};

export const searchUsersAndPosts = async (
  query: string,
  options: number | SearchOptions = {},
): Promise<SidebarSearchAllResult> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { users: [], posts: [], totalUsers: 0, totalPosts: 0, tookMs: 0 };
  }

  const { limit, signal } = resolveSearchOptions(options);
  const safeLimit = toSafeLimit(limit);
  const response = await clientGetJson<SearchAllApiResponse>(
    `/search?type=all&query=${encodeURIComponent(trimmedQuery)}&limit=${safeLimit}`,
    {
      config: signal ? { signal } : undefined,
    },
  );

  if (!response.ok || !response.data.success) {
    return { users: [], posts: [], totalUsers: 0, totalPosts: 0, tookMs: 0 };
  }

  const payload = response.data.data;
  const users = normalizeUsers(payload?.users ?? []);
  const posts = normalizePosts(payload?.posts ?? []);
  const totalUsers = payload?.total?.users ?? users.length;
  const totalPosts = payload?.total?.posts ?? posts.length;
  return {
    users,
    posts,
    totalUsers,
    totalPosts,
    tookMs: payload?.took_ms ?? 0,
  };
};
