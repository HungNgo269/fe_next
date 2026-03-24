"use client";

import type { User } from "@/app/feature/post/types/api.types";
import ProfileFeedView from "@/app/feature/profile/components/ProfileFeedView";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";

type OtherUserProfilePageClientProps = {
  handle: string;
  viewer: User | null;
};

export default function OtherUserProfilePageClient({
  handle,
  viewer,
}: OtherUserProfilePageClientProps) {
  return (
    <ProfileShell>
      <ProfileFeedView handle={handle} mode="other" viewer={viewer} />
    </ProfileShell>
  );
}
