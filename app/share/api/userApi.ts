import { User } from "@/app/feature/post/types/api.types";
import { ApiResponse } from "../utils/api-types";
import { FeedUserProfile } from "@/app/feature/post/types/feed";
import { clientGetJson } from "../utils/api";

export const fetchCurrentUser = async (): Promise<
  ApiResponse<{
    currentUser: User | null;
    currentUserProfile: FeedUserProfile | null;
    isAuthenticated: boolean;
  }>
> => {
  const raw = await clientGetJson<User>("/users/me");
  if (!raw.ok) return raw;
  const user = raw.data;
  return {
    ok: true,
    data: {
      currentUser: user,
      currentUserProfile: {
        id: user.id,
        handle: user.handle ?? null,
        name: user.name,
        email: user.email,
        gender: user.gender ?? "",
        avatar: user.avatarUrl ?? "",
      },
      isAuthenticated: true,
    },
  };
};
