"use client";

import Link from "next/link";
import type { User } from "@/app/feature/post/types/api.types";
import ProfileFeedView from "@/app/feature/profile/components/ProfileFeedView";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";

type UserProfilePageClientProps = {
  viewer: User | null;
};

export default function UserProfilePageClient({
  viewer,
}: UserProfilePageClientProps) {
  return (
    <ProfileShell>
      <ProfileFeedView
        mode="own"
        viewer={viewer}
        postsLabel="Posts"
        emptyMessage="You have not created or shared any posts yet."
        headerActions={
          <Link
            className="ui-btn-primary rounded-lg bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-50"
            href="/profile/edit"
          >
            Edit profile
          </Link>
        }
      />
    </ProfileShell>
  );
}
