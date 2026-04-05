"use client";

import Link from "next/link";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import { useUser } from "@/app/share/providers/UserProvider";
import AppPageState from "@/app/share/components/AppPageState";
import type { AccessState } from "@/app/share/utils/access-state";
import ProfileActions from "./ProfileActions";
import ProfileHeader from "./ProfileHeader";
import ProfilePostFeed from "./ProfilePostFeed";
import FriendRequestsModal from "./FriendRequestsModal";
import UserListModal from "./UserListModal";
import { useProfilePageController } from "../controllers/useProfilePageController";
import ProfileFeedViewSkeleton from "../skeleton/ProfileFeedViewSkeleton";

type ProfileFeedViewProps = {
  profileKey: string;
  initialAccessState: AccessState;
};

export default function ProfileFeedView({
  profileKey,
  initialAccessState,
}: ProfileFeedViewProps) {
  const viewer = useUser();
  const controller = useProfilePageController({
    profileKey,
    viewerId: viewer?.id ?? null,
    initialAccessState,
  });
  const { feed, ui } = controller;
  const {
    profile,
    canEditProfile,
    posts,
    isLoading,
    accessState,
    profileError,
    hasMorePosts,
    totalPosts,
    isLoadingMore,
    handleLoadMore,
  } = feed;
  const ownProfileHref = profile.handle
    ? `/profile/${profile.handle}`
    : profile.id
      ? `/profile/${profile.id}`
      : viewer?.handle
        ? `/profile/${viewer.handle}`
        : viewer?.id
          ? `/profile/${viewer.id}`
          : "/";
  const isOwnProfile = canEditProfile;
  const emptyMessage = isOwnProfile
    ? "You have not created or shared any posts yet."
    : "No posts yet.";

  if (!isLoading && accessState.kind !== "ok") {
    switch (accessState.kind) {
      case "unauthenticated":
        return (
          <AppPageState
            title="Sign in to view this profile"
            message="This profile is only available after you sign in. Other interactive actions like liking or commenting should continue using the login prompt flow."
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/login"
              >
                Sign in
              </Link>
            }
            secondaryAction={
              <Link
                className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/"
              >
                Back to home
              </Link>
            }
            tone="warning"
          />
        );
      case "forbidden":
        return (
          <AppPageState
            title="Access denied"
            message="You are signed in, but you do not have permission to view this profile."
            action={
              <Link
                className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href={ownProfileHref}
              >
                My profile
              </Link>
            }
            tone="error"
          />
        );
      case "payment_required":
      case "not_found":
        return (
          <AppPageState
            title="Profile not found"
            message="The URL may be incorrect, or this user may have changed their username."
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/"
              >
                Back to home
              </Link>
            }
            secondaryAction={
              <Link
                className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href={ownProfileHref}
              >
                My profile
              </Link>
            }
            tone="error"
          />
        );
      case "error":
        return (
          <AppPageState
            title="Unable to load profile"
            message={profileError || "Please try again in a moment."}
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/"
              >
                Back to home
              </Link>
            }
            tone="error"
          />
        );
      default:
        break;
    }
  }

  if (!isLoading && !isOwnProfile && profileError) {
    return (
      <AppPageState
        title="Unable to load profile"
        message={profileError}
        action={
          <Link
            className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
            href="/"
          >
            Back to home
          </Link>
        }
        secondaryAction={
          <Link
            className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
            href={ownProfileHref}
          >
            My profile
          </Link>
        }
        tone="error"
      />
    );
  }

  if (isLoading) {
    return <ProfileFeedViewSkeleton />;
  }

  return (
    <main className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
      <ProfileHeader
        avatarUrl={profile.avatar}
        name={profile.name}
        handle={profile.handle}
        bio={profile.bio}
        postsCount={totalPosts ?? posts.length}
        friendsCount={profile.friendsCount ?? 0}
        followersCount={profile.followersCount ?? 0}
        followingCount={profile.followingCount ?? 0}
        onOpenList={ui.openListModal}
      >
        {canEditProfile ? (
          <>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-95"
                href="/profile/edit"
              >
                Edit profile
              </Link>
              <ProfileActions variant="logout" />
            </div>
            <ProfileActions
              variant="own"
              incomingCount={ui.incomingCount}
              onOpenFriendRequests={ui.openFriendRequestsModal}
            />
          </>
        ) : (
          <ProfileActions
            variant="other"
            profileId={profile.id ?? ""}
            isFollowing={profile.isFollowing ?? false}
            followersCount={profile.followersCount ?? 0}
            friendsCount={profile.friendsCount ?? 0}
            friendshipStatus={profile.friendshipStatus ?? "NONE"}
          />
        )}
      </ProfileHeader>

      <ProfilePostFeed
        posts={posts}
        canEditProfile={canEditProfile}
        postsLabel="Posts"
        emptyMessage={emptyMessage}
        hasMorePosts={hasMorePosts}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />

      <PostDetailModal />
      <UserListModal
        isOpen={ui.listModalOpen}
        onClose={ui.closeListModal}
        listType={ui.listModalType}
        userId={profile.id ?? ""}
      />
      <FriendRequestsModal
        isOpen={ui.friendRequestsModalOpen}
        onClose={ui.closeFriendRequestsModal}
      />
    </main>
  );
}
