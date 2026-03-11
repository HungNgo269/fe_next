import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { User } from "../../post/types/api.types";

export const fetchSuggestedUsersServer = async (): Promise<User[]> => {
  const result = await serverGetJson<User[]>("/users", {
    includeAuth: false,
    cache: "force-cache",
    next: { revalidate: 120, tags: ["suggested-users"] },
  });

  return result.ok ? result.data : [];
};
