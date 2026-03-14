"use client";

import Link from "next/link";
import ProfileFeedView from "../feature/profile/views/ProfileFeedView";
import ProfileShell from "../feature/profile/components/ProfileShell";

export default function UserProfilePageClient() {
  return (
    <ProfileShell>
      <ProfileFeedView
        mode="own"
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
