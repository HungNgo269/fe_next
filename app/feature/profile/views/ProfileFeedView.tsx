import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import FeedComposer from "@/app/feature/post/components/FeedComposer";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import ProfileAvatarPreview from "@/app/feature/profile/components/ProfileAvatarPreview";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import type { useProfileFeed } from "@/app/feature/profile/hooks/useProfileFeed";
import type { Post } from "@/app/feature/post/types/api.types";
import { usePostDetailModal } from "@/app/feature/post/hooks/usePostDetailModal";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";
import { Loader2 } from "lucide-react";

type ProfileFeedState = ReturnType<typeof useProfileFeed>;

type ProfileFeedViewProps = ProfileFeedState & {
  headerActions?: ReactNode;
  postsLabel?: string;
  emptyMessage?: string;
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
  isLoadingMore,
  handleLoadMore,
  headerActions,
  postsLabel = "Posts",
  emptyMessage = "No posts yet.",
}: ProfileFeedViewProps) {
  void currentUserAvatar;
  const openModal = usePostDetailModal((s) => s.openModal);
  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: hasMorePosts,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
  });

  const composerUser = useMemo(
    () => ({
      id: profile.id ?? "",
      name: profile.name,
      email: profile.email ?? "",
      avatarUrl: profile.avatar,
      gender: profile.gender ?? undefined,
    }),
    [profile.id, profile.name, profile.email, profile.avatar, profile.gender],
  );

  if (isLoading) {
    return (
      <main className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 pb-16 pt-12 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </main>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
        <ProfileStatusCard
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                href="/login"
              >
                Sign in
              </Link>
            </div>
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
      <section className=" rounded-md p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatarPreview
              avatarUrl={profile.avatar}
              fallbackInitials={initials}
              name={profile.name}
            />
            <div>
              <p className="text-xl font-semibold text-foreground">
                {profile.name || "Unnamed user"}
              </p>
              <p className="ui-text-muted text-sm">
                {profile.email || "No email"}
              </p>
              <p className="ui-text-muted text-xs uppercase tracking-wider">
                {profile.gender || "Unknown"}
              </p>
            </div>
          </div>
          {headerActions ? (
            <div className="flex items-center gap-2">{headerActions}</div>
          ) : null}
        </div>
        {profileError ? (
          <p className="ui-alert-warning mt-4 rounded-2xl px-4 py-3 text-sm">
            {profileError}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {postsLabel}
          </h2>
        </header>

        {postsError ? (
          <div className="ui-alert-warning rounded-2xl px-4 py-3 text-sm">
            {postsError}
          </div>
        ) : null}

        {canEditProfile ? <FeedComposer currentUser={composerUser} /> : null}

        {posts.length === 0 ? (
          <p className="ui-text-muted text-sm">{emptyMessage}</p>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post as unknown as Post}
                  index={index}
                  onOpenDetail={openModal}
                />
              ))}
            </div>

            {hasMorePosts ? (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div aria-hidden="true" className="h-2 w-full" ref={loadMoreSentinelRef} />
                {isLoadingMore ? (
                  <div
                    aria-live="polite"
                    className="inline-flex items-center justify-center"
                  >
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Loading more posts</span>
                  </div>
                ) : (
                  <button
                    className="ui-btn-primary inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-colors"
                    onClick={() => void handleLoadMore()}
                    type="button"
                  >
                    Load 5 more posts
                  </button>
                )}
              </div>
            ) : null}
          </>
        )}
      </section>

      <PostDetailModal />
    </main>
  );
}
