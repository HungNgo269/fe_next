"use client";

import Link from "next/link";
import { useCallback } from "react";
import { getCurrentUserProfileFeed } from "../feature/profile/api/profileApi";
import { useProfileFeed } from "../feature/profile/hooks/useProfileFeed";
import ProfileFeedView from "../feature/profile/views/ProfileFeedView";
import ProfileShell from "../feature/profile/components/ProfileShell";

export default function UserProfilePage() {
  const fetchFn = useCallback(
    (page: number, limit: number) => getCurrentUserProfileFeed(page, limit),
    [],
  );

  const feed = useProfileFeed({ fetchFn, isOwnProfile: true });

  return (
    <ProfileShell>
      <ProfileFeedView
        {...feed}
        postsLabel="Your posts"
        emptyMessage="You have not created any posts yet."
        headerActions={
          <Link
            className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
            href="/profile/edit"
          >
            Edit your profile
          </Link>
        }
      />
    </ProfileShell>
  );
}
