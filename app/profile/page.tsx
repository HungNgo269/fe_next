import UserProfilePageClient from "./UserProfilePageClient";
import { getCurrentUserProfileFeedServer } from "../feature/profile/api/profileApi.server";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { ProfileFeedResponse } from "../feature/profile/types/api.types";

const PROFILE_ME_QUERY_KEY = ["profile-feed", "me", "me"] as const;

export default async function UserProfilePage() {
  const queryClient = new QueryClient();
  const initialFeed = await getCurrentUserProfileFeedServer(1, 5);

  if (initialFeed.ok) {
    queryClient.setQueryData<ProfileFeedResponse>(PROFILE_ME_QUERY_KEY, initialFeed.data);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfilePageClient />
    </HydrationBoundary>
  );
}
