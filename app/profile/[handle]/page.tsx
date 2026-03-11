import OtherUserProfilePageClient from "./OtherUserProfilePageClient";
import { getUserProfileFeedServer } from "../../feature/profile/api/profileApi.server";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ProfileFeedResponse } from "../../feature/profile/types/api.types";

type OtherUserProfilePageProps = {
  params: { handle: string };
};

export default async function OtherUserProfilePage({
  params,
}: OtherUserProfilePageProps) {
  const { handle } = params;
  const queryClient = new QueryClient();
  const initialFeed = await getUserProfileFeedServer(handle, 1, 5);
  const queryKey = ["profile-feed", "other", handle] as const;

  if (initialFeed.ok) {
    queryClient.setQueryData<ProfileFeedResponse>(queryKey, initialFeed.data);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OtherUserProfilePageClient handle={handle} />
    </HydrationBoundary>
  );
}
