import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import ProfileHeader from "@/app/feature/profile/components/ProfileHeader";
import ProfilePostFeed from "@/app/feature/profile/components/ProfilePostFeed";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import UserListModal from "@/app/feature/profile/components/UserListModal";
import FriendRequestsModal from "@/app/feature/profile/components/FriendRequestsModal";
import type { UserListType } from "@/app/feature/profile/types/user-list.types";
import type { Post } from "@/app/feature/post/types/api.types";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { fetchFriendRequests } from "@/app/feature/profile/api/userListApi";
import ProfileActions from "../components/ProfileActions";
import { logout } from "@/app/feature/auth/api/authApi";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import {
  getCurrentUserProfileFeed,
  getUserProfileFeed,
} from "@/app/feature/profile/api/profileApi";
import { useProfileFeed } from "@/app/feature/profile/hooks/useProfileFeed";

type BaseProfileFeedViewProps = {
  headerActions?: ReactNode;
  postsLabel?: string;
  emptyMessage?: string;
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
  const { mode, headerActions, postsLabel = "Posts", emptyMessage = "No posts yet." } =
    props;
  const handle = mode === "other" ? props.handle : undefined;
  const profileKey = mode === "own" ? "me" : handle ?? "default";
  const fetchFn = useCallback(
    (page: number, limit: number) =>
      mode === "own"
        ? getCurrentUserProfileFeed(page, limit)
        : getUserProfileFeed(handle ?? "", page, limit),
    [mode, handle],
  );

  const {
    profile,
    currentUserAvatar,
    canEditProfile,
    posts,
    isLoading,
    isUnauthorized,
    profileError,
    postsError,
    hasMorePosts,
    totalPosts,
    isLoadingMore,
    handleLoadMore,
  } = useProfileFeed({
    fetchFn,
    isOwnProfile: mode === "own",
    profileKey,
  });

  void currentUserAvatar;

  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );

  const [listModalType, setListModalType] = useState<UserListType | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: async () => {
      const res = await fetchFriendRequests();
      return res.ok ? res.data : [];
    },
    enabled: canEditProfile,
  });
  const incomingCount = pendingRequests.filter(
    (r) => r.direction === "incoming",
  ).length;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      clearAuthenticatedProfile();
      queryClient.clear();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        onOpenList={(type) => {
          setListModalType(type);
          setListModalOpen(true);
        }}
        profileError={profileError}
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
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:brightness-95 disabled:opacity-60"
              >
                Logout
              </button>
            </div>
            <ProfileActions
              variant="own"
              incomingCount={incomingCount}
              onOpenFriendRequests={() => setFriendRequestsModalOpen(true)}
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
        posts={posts as unknown as Post[]}
        profile={profile}
        canEditProfile={canEditProfile}
        postsLabel={postsLabel}
        emptyMessage={emptyMessage}
        postsError={postsError}
        hasMorePosts={hasMorePosts}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />

      <PostDetailModal />
      <UserListModal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        listType={listModalType}
        userId={profile.id ?? ""}
      />
      <FriendRequestsModal
        isOpen={friendRequestsModalOpen}
        onClose={() => setFriendRequestsModalOpen(false)}
      />
    </main>
  );
}
