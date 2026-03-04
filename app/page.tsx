import FeedPage from "@/app/feature/post/components/FeedPage";
import { prefetchFeedPosts } from "@/app/feature/post/api/postApi.server";
import { FEED_QUERY_KEY } from "@/app/feature/post/hooks/feedQueryKeys";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: prefetchFeedPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeedPage />
    </HydrationBoundary>
  );
}
