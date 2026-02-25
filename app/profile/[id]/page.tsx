"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getUserProfileFeed } from "../../feature/profile/api/profileApi";
import { useProfileFeed } from "../../feature/profile/hooks/useProfileFeed";
import ProfileFeedView from "../../feature/profile/views/ProfileFeedView";
import ProfileShell from "../../feature/profile/components/ProfileShell";

export default function OtherUserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const fetchFn = useCallback(
    (page: number, limit: number) => getUserProfileFeed(id, page, limit),
    [id],
  );

  const feed = useProfileFeed({ fetchFn });

  return (
    <ProfileShell>
      <ProfileFeedView
        {...feed}
        postsLabel="Posts"
        emptyMessage="This user has not created any posts yet."
        headerActions={
          feed.canEditProfile ? (
            <>
              <Link
                className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                href="/profile/edit"
              >
                Edit your profile
              </Link>
              <Link
                className="ui-btn-ghost rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                href="/"
              >
                Back to feed
              </Link>
            </>
          ) : (
            <Link
              className="ui-btn-ghost rounded-full px-4 py-2 text-xs font-semibold transition-colors"
              href="/"
            >
              Back to feed
            </Link>
          )
        }
      />
    </ProfileShell>
  );
}
