"use client";

import ProfileFeedView from "@/app/feature/profile/views/ProfileFeedView";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";

type OtherUserProfilePageClientProps = {
  handle: string;
};

export default function OtherUserProfilePageClient({
  handle,
}: OtherUserProfilePageClientProps) {
  return (
    <ProfileShell>
      <ProfileFeedView handle={handle} mode="other" />
    </ProfileShell>
  );
}
