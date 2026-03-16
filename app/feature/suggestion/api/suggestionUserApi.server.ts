import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { User } from "../../post/types/api.types";

type FetchSuggestedUsersServerOptions = {
  excludeUserId?: string | null;
  limit?: number;
};

export const fetchSuggestedUsersServer = async (
  options: FetchSuggestedUsersServerOptions = {},
): Promise<User[]> => {
  const result = await serverGetJson<User[]>("/users", {
    includeAuth: false,
    cache: "force-cache",
    next: { revalidate: 1800, tags: ["suggested-users"] },
  });

  if (!result.ok) {
    return [];
  }

  const filtered = options.excludeUserId
    ? result.data.filter((user) => user.id !== options.excludeUserId)
    : result.data;

  return typeof options.limit === "number"
    ? filtered.slice(0, options.limit)
    : filtered;
};
