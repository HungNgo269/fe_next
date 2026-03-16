import "server-only";

import { serverGetJson } from "@/app/share/utils/api.server";
import type { User } from "@/app/feature/post/types/api.types";
import type { StoryData } from "@/app/feature/story/types/story";
import { STORY_THEMES, STORY_TITLES } from "@/app/feature/story/data/story";

export const fetchStoryUsersServer = async (): Promise<User[]> => {
  const result = await serverGetJson<User[]>("/users", {
    includeAuth: false,
    cache: "force-cache",
    next: { revalidate: 60, tags: ["feed-stories"] },
  });

  return result.ok ? result.data : [];
};

export const mapUsersToStories = (
  users: User[],
  currentUserId?: string | null,
): StoryData[] =>
  users
    .filter((user) => user.id !== currentUserId)
    .slice(0, 4)
    .map((user, index) => ({
      id: `story-${user.id}`,
      title: STORY_TITLES[index % STORY_TITLES.length],
      author: user,
      theme: STORY_THEMES[index % STORY_THEMES.length],
    }));

