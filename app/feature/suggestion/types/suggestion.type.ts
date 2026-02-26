import type { User } from "@/app/feature/post/types/api.types";

export type Suggestion = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  gender?: string;
  note: string;
};

export const userToSuggestion = (user: User): Suggestion => ({
  id: user.id,
  name: user.name,
  handle: user.handle || user.email.split("@")[0] || user.id,
  avatar: user.avatarUrl ?? undefined,
  gender: user.gender,
  note: `@${user.handle || user.email.split("@")[0] || "user"}`,
});
