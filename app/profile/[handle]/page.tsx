"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useParams } from "next/navigation";
import { getUserProfileFeed } from "../../feature/profile/api/profileApi";
import { useProfileFeed } from "../../feature/profile/hooks/useProfileFeed";
import { useFollowUser } from "../../feature/profile/hooks/useFollowUser";
import ProfileFeedView from "../../feature/profile/views/ProfileFeedView";
import ProfileShell from "../../feature/profile/components/ProfileShell";

export default function OtherUserProfilePage() {
  const { handle } = useParams<{ handle: string }>();

  const fetchFn = useCallback(
    (page: number, limit: number) => getUserProfileFeed(handle, page, limit),
    [handle],
  );

  const feed = useProfileFeed({ fetchFn, profileKey: handle });
  const { followUser, unfollowUser, isFollowingLoading } = useFollowUser(
    feed.profile.id ?? "",
    handle,
  );

  if (!feed.isLoading && (feed.profileError || feed.isUnauthorized)) {
    return (
      <ProfileShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              {feed.isUnauthorized ? "Access Denied" : "User Not Found"}
            </h1>
            <p className="ui-text-muted max-w-md text-sm">
              {feed.isUnauthorized
                ? "You don't have permission to view this profile."
                : `This user may have changed their username or the link may be incorrect.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              href="/profile"
            >
              My profile
            </Link>
          </div>
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <ProfileFeedView
        {...feed}
        postsLabel="Posts and shares"
        emptyMessage="This user has not created or shared any posts yet."
        headerActions={
          feed.canEditProfile ? (
            <Link
              className="ui-btn-primary rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              href="/profile/edit"
            >
            </Link>
          ) : (
            feed.profile.id && (
              <button
                type="button"
                className={`rounded-lg px-6 py-1.5 text-sm font-semibold transition-colors ${
                  feed.profile.isFollowing
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "ui-btn-primary bg-blue-500 text-white hover:bg-blue-600"
                }`}
                disabled={isFollowingLoading}
                onClick={() =>
                  feed.profile.isFollowing ? unfollowUser() : followUser()
                }
              >
                {feed.profile.isFollowing ? "Followed" : "Follow"}
              </button>
            )
          )
        }
      />
    </ProfileShell>
  );
}
