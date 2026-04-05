import ProfileFeedView from "@/app/feature/profile/components/ProfileFeedView";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";
import { getUserProfileFeedServer } from "@/app/feature/profile/api/profileApi.server";
import {
  OK_ACCESS_STATE,
  getAccessStateFromStatus,
} from "@/app/share/utils/access-state";
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
  const initialAccessState = initialFeed.ok
    ? OK_ACCESS_STATE
    : getAccessStateFromStatus(
        initialFeed.error.status,
        initialFeed.error.messages[0],
      );

  if (initialFeed.ok) {
    queryClient.setQueryData<ProfileFeedResponse>(
      profileQueryKeys.detail(handle),
      initialFeed.data,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileShell>
        <ProfileFeedView
          profileKey={handle}
          initialAccessState={initialAccessState}
        />
      </ProfileShell>
    </HydrationBoundary>
  );
}
