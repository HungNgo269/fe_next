"use client";

import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import FeedPostListSkeleton from "@/app/feature/feed/skeleton/FeedPostListSkeleton";
import PostCard from "@/app/feature/post/components/PostCard";
import type { Post } from "@/app/feature/post/types/api.types";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";

interface ProfilePostFeedProps {
  posts: Post[];
  canEditProfile: boolean;
  postsLabel: string;
  emptyMessage: string;
  hasMorePosts: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void | Promise<void>;
}

export default function ProfilePostFeed({
  posts,
  canEditProfile,
  postsLabel,
  emptyMessage,
  hasMorePosts,
  isLoadingMore,
  onLoadMore,
}: ProfilePostFeedProps) {
  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: hasMorePosts,
    isLoading: isLoadingMore,
    onLoadMore,
  });

  return (
    <section className="space-y-3">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{postsLabel}</h2>
      </header>

      {canEditProfile ? <FeedComposer /> : null}

      {posts.length === 0 ? (
        <p className="ui-text-muted text-sm">{emptyMessage}</p>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMorePosts ? (
            <div className="flex flex-col items-center gap-3 pt-2">
              <div
                aria-hidden="true"
                className="h-2 w-full"
                ref={loadMoreSentinelRef}
              />
              {isLoadingMore ? (
                <div aria-live="polite" className="w-full">
                  <FeedPostListSkeleton count={1} />
                </div>
              ) : (
                <button
                  type="button"
                  className="ui-btn-primary inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold transition-colors"
                  onClick={() => void onLoadMore()}
                >
                  Load 5 more posts
                </button>
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
