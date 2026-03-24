import Link from "next/link";
import { useCallback, type ReactNode } from "react";
import type { User } from "@/app/feature/post/types/api.types";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import ProfileActions from "./ProfileActions";
import ProfileHeader from "./ProfileHeader";
import ProfilePostFeed from "./ProfilePostFeed";
import ProfileStatusCard from "./ProfileStatusCard";
import FriendRequestsModal from "./FriendRequestsModal";
import UserListModal from "./UserListModal";
import {
  getCurrentUserProfileFeed,
  getUserProfileFeed,
} from "../api/profileApi";
import { useProfilePageController } from "../controllers/useProfilePageController";

type BaseProfileFeedViewProps = {
  headerActions?: ReactNode;
  postsLabel?: string;
  emptyMessage?: string;
  viewer?: User | null;
};

type OwnProfileFeedViewProps = BaseProfileFeedViewProps & {
  mode: "own";
};

type OtherProfileFeedViewProps = BaseProfileFeedViewProps & {
  mode: "other";
  handle: string;
};

type ProfileFeedViewProps = OwnProfileFeedViewProps | OtherProfileFeedViewProps;

export default function ProfileFeedView(props: ProfileFeedViewProps) {
  const {
    mode,
    headerActions,
    postsLabel = "Posts",
    emptyMessage = "No posts yet.",
  } = props;

  const handle = mode === "other" ? props.handle : undefined;
  const profileKey = mode === "own" ? "me" : (handle ?? "default");

  const fetchFn = useCallback(
    (page: number, limit: number) =>
      mode === "own"
        ? getCurrentUserProfileFeed(page, limit)
        : getUserProfileFeed(handle ?? "", page, limit),
    [mode, handle],
  );

  const controller = useProfilePageController({
    fetchFn,
    isOwnProfile: mode === "own",
    profileKey,
    viewerId: props.viewer?.id ?? null,
  });
  const { feed, ui } = controller;
  const {
    profile,
    canEditProfile,
    posts,
    isLoading,
    isUnauthorized,
    profileError,
    hasMorePosts,
    totalPosts,
    isLoadingMore,
    handleLoadMore,
  } = feed;

  const resolvedHeaderActions = canEditProfile ? null : headerActions;

  if (mode === "other" && !isLoading && (profileError || isUnauthorized)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isUnauthorized ? "Access Denied" : "User Not Found"}
          </h1>
          <p className="ui-text-muted max-w-md text-sm">
            {isUnauthorized
              ? "You don't have permission to view this profile."
              : "This user may have changed their username or the link may be incorrect."}
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
    );
  }

  if (isLoading) {
    return (
      <main className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 pb-16 pt-12 sm:px-6">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
      </main>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
        <ProfileStatusCard
          action={
            <Link
              className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
              href="/login"
            >
              Sign in
            </Link>
          }
          message="You can browse the app without logging in, but your personal profile is only available after sign-in."
          title="Profile is locked"
          variant="error"
        />
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
      <ProfileHeader
        avatarUrl={profile.avatar}
        name={profile.name}
        handle={profile.handle}
        bio={profile.bio}
        headerActions={resolvedHeaderActions}
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
              <button
                type="button"
                onClick={() => void ui.handleLogout()}
                disabled={ui.isLoggingOut}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-95 disabled:opacity-60"
              >
                Logout
              </button>
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
            profileKey={profileKey}
            isFollowing={profile.isFollowing ?? false}
            friendshipStatus={profile.friendshipStatus ?? "NONE"}
          />
        )}
      </ProfileHeader>

      <ProfilePostFeed
        posts={posts}
        profile={profile}
        canEditProfile={canEditProfile}
        postsLabel={postsLabel}
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
        currentUserId={props.viewer?.id ?? null}
      />
      <FriendRequestsModal
        isOpen={ui.friendRequestsModalOpen}
        onClose={ui.closeFriendRequestsModal}
      />
    </main>
  );
}
