"use client";

import { useCallback } from "react";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import RightSidebar from "@/app/components/layout/RightSidebar";
import { useFeedQuery } from "@/app/feature/feed/hooks/useFeedQuery";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { usePostDetailModal } from "@/app/feature/post/hooks/usePostDetailModal";
import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import StoryList from "@/app/feature/story/components/StoryList";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import type { Post } from "@/app/feature/post/types/api.types";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "@/app/share/stores/appSessionStore";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";
import { Loader2 } from "lucide-react";

export default function FeedPage() {
  const {
    data,
    error,
    posts,
    hasMorePosts,
    isLoadingMore,
    postsError,
    handleLoadMore,
  } = useFeedQuery();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const showLoginDialog = usePostUIStore((s) => s.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const openModal = usePostDetailModal((s) => s.openModal);
  const handleOpenDetail = useCallback(
    (post: Post) => openModal(post, { syncUrl: true }),
    [openModal],
  );
  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: hasMorePosts,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
  });

  const currentUser = data?.currentUser ?? toAvatarFromProfile(authProfile);
  const feedPosts: Post[] = posts ?? [];
  const feedError = error?.message ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative grid min-w-0 w-full grid-cols-12 gap-6 px-4 pb-24 pt-10 sm:px-6 lg:pb-16">
        <div className="lg:col-span-2"></div>

        <section className="col-span-12 min-w-0 space-y-6 lg:col-span-6">
          {feedError ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
              {feedError}
            </div>
          ) : null}

          <StoryList />

          {currentUser ? <FeedComposer currentUser={currentUser} /> : null}

          <div className="space-y-6">
            {feedPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onOpenDetail={handleOpenDetail}
              />
            ))}

            {postsError ? (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
                {postsError}
              </div>
            ) : null}

            {hasMorePosts ? (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div
                  aria-hidden="true"
                  className="h-2 w-full"
                  ref={loadMoreSentinelRef}
                />
                {isLoadingMore ? (
                  <div
                    aria-live="polite"
                    className="inline-flex items-center justify-center"
                  >
                    <Loader2
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                  </div>
                ) : (
                  <button
                    className="ui-btn-primary inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-colors"
                    onClick={() => void handleLoadMore()}
                    type="button"
                  >
                    Load more posts
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <RightSidebar />
      </main>

      <PostDetailModal />

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
