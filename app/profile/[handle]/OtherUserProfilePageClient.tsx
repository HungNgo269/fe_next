"use client";

import ProfileFeedView from "../../feature/profile/views/ProfileFeedView";
import ProfileShell from "../../feature/profile/components/ProfileShell";

type OtherUserProfilePageClientProps = {
  handle: string;
};

export default function OtherUserProfilePageClient({
  handle,
}: OtherUserProfilePageClientProps) {
  return (
    <ProfileShell>
      <ProfileFeedView
        mode="other"
        handle={handle}
        postsLabel="Posts and shares"
        emptyMessage="This user has not created or shared any posts yet."
      />
    </ProfileShell>
  );
}
