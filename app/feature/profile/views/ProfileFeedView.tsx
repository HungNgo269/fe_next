import Link from "next/link";
import { useState, type ReactNode } from "react";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import ProfileHeader from "@/app/feature/profile/components/ProfileHeader";
import ProfilePostFeed from "@/app/feature/profile/components/ProfilePostFeed";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import UserListModal from "@/app/feature/profile/components/UserListModal";
import FriendRequestsModal from "@/app/feature/profile/components/FriendRequestsModal";
import type { UserListType } from "@/app/feature/profile/types/user-list.types";
import type { Post } from "@/app/feature/post/types/api.types";
import { useFollowUser } from "@/app/feature/profile/hooks/useFollowUser";
import { useFriendActions } from "@/app/feature/profile/hooks/useFriendActions";
import { useQuery } from "@tanstack/react-query";
import { fetchFriendRequests } from "@/app/feature/profile/api/userListApi";
import type { useProfileFeed } from "@/app/feature/profile/hooks/useProfileFeed";
import ProfileActions from "../components/ProfileActions";

type ProfileFeedState = ReturnType<typeof useProfileFeed>;

type ProfileFeedViewProps = ProfileFeedState & {
  headerActions?: ReactNode;
  postsLabel?: string;
  emptyMessage?: string;
  profileKey?: string;
};

export default function ProfileFeedView({
  profile,
  initials,
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
  headerActions,
  postsLabel = "Posts",
  emptyMessage = "No posts yet.",
  profileKey = "default",
}: ProfileFeedViewProps) {
  void currentUserAvatar;

  const [listModalType, setListModalType] = useState<UserListType | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);

  const { followUser, unfollowUser, isFollowingLoading } = useFollowUser(
    profile.id ?? "",
    profileKey,
  );
  const {
    sendRequest,
    cancelRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    isFriendActionLoading,
  } = useFriendActions(profile.id ?? "", profileKey);

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
        initials={initials}
        name={profile.name}
        handle={profile.handle}
        headerActions={headerActions}
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
          <ProfileActions
            variant="own"
            incomingCount={incomingCount}
            onOpenFriendRequests={() => setFriendRequestsModalOpen(true)}
          />
        ) : (
          <ProfileActions
            variant="other"
            isFollowing={profile.isFollowing ?? false}
            isFollowingLoading={isFollowingLoading}
            onFollow={followUser}
            onUnfollow={unfollowUser}
            friendshipStatus={profile.friendshipStatus ?? "NONE"}
            isFriendActionLoading={isFriendActionLoading}
            onSendRequest={sendRequest}
            onCancelRequest={cancelRequest}
            onAcceptRequest={acceptRequest}
            onDeclineRequest={declineRequest}
            onRemoveFriend={removeFriend}
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
        userId={profile.id!}
      />
      <FriendRequestsModal
        isOpen={friendRequestsModalOpen}
        onClose={() => setFriendRequestsModalOpen(false)}
      />
    </main>
  );
}
