import ProfileFeedView from "@/app/feature/profile/components/ProfileFeedView";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";
import { getUserProfileFeedServer } from "@/app/feature/profile/api/profileApi.server";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import type { ProfileFeedResponse } from "@/app/feature/profile/types/api.types";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";

type OtherUserProfilePageProps = {
  params: Promise<{ handle: string }>;
};

export default async function OtherUserProfilePage({
  params,
}: OtherUserProfilePageProps) {
  const { handle } = await params;
  const queryClient = new QueryClient();
  const initialFeed = await getUserProfileFeedServer(handle, 1, 5);

  if (initialFeed.ok) {
    queryClient.setQueryData<ProfileFeedResponse>(
      profileQueryKeys.detail(handle),
      initialFeed.data,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileShell>
        <ProfileFeedView profileKey={handle} />
      </ProfileShell>
    </HydrationBoundary>
  );
}
