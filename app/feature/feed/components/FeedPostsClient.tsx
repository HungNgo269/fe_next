"use client";

import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import FeedPostListSkeleton from "@/app/feature/feed/skeleton/FeedPostListSkeleton";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { useUser } from "@/app/share/providers/UserProvider";
import type { FeedPagination, Post } from "@/app/feature/post/types/api.types";
import { useFeedPageController } from "../controllers/useFeedPageController";

type FeedPostsClientProps = {
  initialPosts: Post[];
  initialPagination: FeedPagination;
  feedError?: string;
};

export default function FeedPostsClient({
  initialPosts,
  initialPagination,
  feedError,
}: FeedPostsClientProps) {
  const currentUser = useUser();
  const {
    posts,
    hasMore,
    isLoadingMore,
    loadMoreSentinelRef,
    showLoginDialog,
    closeLoginDialog,
  } = useFeedPageController({
    initialPosts,
    initialPagination,
    feedError,
  });

  return (
    <>
      {feedError && initialPosts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-destructive">
          {feedError}
        </div>
      ) : null}

      {currentUser ? <FeedComposer /> : null}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {hasMore ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div
              ref={loadMoreSentinelRef}
              className="h-1 w-full"
              aria-hidden="true"
            />

            {isLoadingMore ? (
              <div aria-live="polite" className="w-full">
                <FeedPostListSkeleton count={1} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <PostDetailModal />
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={closeLoginDialog}
      />
    </>
  );
}
