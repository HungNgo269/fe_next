import type { QueryClient } from "@tanstack/react-query";
import type { FeedBootstrapData } from "@/app/feature/feed/types/feed";
import type { Post } from "../types/api.types";
import { FEED_QUERY_KEY } from "@/app/share/hooks/feedQueryKeys";

export function findPostInCaches(
  queryClient: QueryClient,
  postId: string,
): Post | undefined {
  const feedData = queryClient.getQueryData<FeedBootstrapData>(FEED_QUERY_KEY);
  const fromFeed =
    feedData?.posts.find((p) => p.id === postId) ??
    feedData?.posts.find((p) => p.sourcePostId === postId);
  if (fromFeed) return fromFeed;

  const profileCaches = queryClient.getQueriesData<{ posts: Post[] }>({
    queryKey: ["profile-feed"],
  });
  for (const [, data] of profileCaches) {
    const found =
      data?.posts.find((p) => p.id === postId) ??
      data?.posts.find((p) => p.sourcePostId === postId);
    if (found) return found;
  }

  return undefined;
}
