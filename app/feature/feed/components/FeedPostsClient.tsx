"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { fetchPosts } from "@/app/feature/post/api/postApi";
import { FEED_PAGE_SIZE } from "@/app/share/hooks/feedQueryKeys";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";
import type { FeedPagination, Post, User } from "@/app/feature/post/types/api.types";
import { mergeUniquePosts } from "@/app/feature/post/utils/postCache";
import { toast } from "sonner";

type FeedPostsClientProps = {
  currentUser: User | null;
  initialPosts: Post[];
  initialPagination: FeedPagination;
  feedError?: string;
};

type FeedState = {
  posts: Post[];
  pagination: FeedPagination;
};

export default function FeedPostsClient({
  currentUser,
  initialPosts,
  initialPagination,
  feedError,
}: FeedPostsClientProps) {
  const [feed, setFeed] = useState<FeedState>({
    posts: initialPosts,
    pagination: initialPagination,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const showLoginDialog = usePostUIStore((s) => s.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);

  useEffect(() => {
    setFeed({ posts: initialPosts, pagination: initialPagination });
  }, [initialPagination, initialPosts]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !feed.pagination.hasMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = feed.pagination.page + 1;
      const result = await fetchPosts(nextPage, feed.pagination.limit || FEED_PAGE_SIZE);

      if (!result.ok) {
        toast.error("Unable to load more posts.");
        return;
      }

      setFeed((current) => ({
        posts: mergeUniquePosts(current.posts, result.data.posts),
        pagination: result.data.pagination,
      }));
    } finally {
      setIsLoadingMore(false);
    }
  }, [feed.pagination, isLoadingMore]);

  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: feed.pagination.hasMore,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
    rootMargin: "240px 0px",
  });

  return (
    <>
      {feedError && initialPosts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-destructive">
          {feedError}
        </div>
      ) : null}

      {currentUser ? <FeedComposer currentUser={currentUser} /> : null}

      <div className="space-y-6">
        {feed.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {feed.pagination.hasMore ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            <div
              ref={loadMoreSentinelRef}
              className="h-1 w-full"
              aria-hidden="true"
            />

            {isLoadingMore ? (
              <div aria-live="polite" className="inline-flex items-center justify-center">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <PostDetailModal />
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
}
