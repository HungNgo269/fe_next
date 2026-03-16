import FeedPostsClient from "@/app/feature/feed/components/FeedPostsClient";
import { fetchFeedPostsOnlySsr } from "@/app/feature/feed/api/feedApi.server";
import type { User } from "@/app/feature/post/types/api.types";

export default async function FeedPostsServer({
  currentUser,
}: {
  currentUser: User | null;
}) {
  const { posts, pagination } = await fetchFeedPostsOnlySsr();

  return (
    <FeedPostsClient
      currentUser={currentUser}
      initialPagination={pagination}
      initialPosts={posts}
    />
  );
}
