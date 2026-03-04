import type { User } from "@/app/feature/post/types/api.types";

export type StoryData = {
  id: string;
  title: string;
  author: User;
  theme: string;
};
