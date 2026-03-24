import UserProfilePageClient from "./UserProfilePageClient";
import { getCurrentUserProfileFeedServer } from "@/app/feature/profile/api/profileApi.server";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ProfileFeedResponse } from "@/app/feature/profile/types/api.types";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";

export default async function UserProfilePage() {
  const queryClient = new QueryClient();
  const [viewer, initialFeed] = await Promise.all([
    fetchCurrentUserServer(),
    getCurrentUserProfileFeedServer(1, 5),
  ]);

  if (initialFeed.ok) {
    queryClient.setQueryData<ProfileFeedResponse>(profileQueryKeys.me(), initialFeed.data);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfilePageClient viewer={viewer} />
    </HydrationBoundary>
  );
}
