import type { QueryClient } from "@tanstack/react-query";
import type { Post } from "../types/api.types";
import {
  findFeedPost,
  type FeedPostsInfiniteData,
} from "@/app/feature/feed/queries/feed.cache";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";

export function mergeUniquePosts(base: Post[], incoming: Post[]): Post[] {
  if (incoming.length === 0) {
    return base;
  }

  const seen = new Set(base.map((post) => post.id));
  const merged = [...base];

  for (const post of incoming) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    merged.push(post);
  }

  return merged;
}

export function findPostInCaches(
  queryClient: QueryClient,
  postId: string,
): Post | undefined {
  const feedData = queryClient.getQueryData<FeedPostsInfiniteData>(
    feedQueryKeys.list(),
  );
  const fromFeed = findFeedPost(feedData, postId);
  if (fromFeed) return fromFeed;

  const profileCaches = queryClient.getQueriesData<{ posts: Post[] }>({
    queryKey: profileQueryKeys.all,
  });
  for (const [, data] of profileCaches) {
    const found =
      data?.posts.find((p) => p.id === postId) ??
      data?.posts.find((p) => p.sourcePostId === postId);
    if (found) return found;
  }

  return undefined;
}
