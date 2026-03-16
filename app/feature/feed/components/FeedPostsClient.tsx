"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { fetchPosts } from "@/app/feature/post/api/postApi";
import { FEED_PAGE_SIZE } from "@/app/share/hooks/feedQueryKeys";
import type { FeedPagination, Post, User } from "@/app/feature/post/types/api.types";
import { toast } from "sonner";

type FeedPostsClientProps = {
  currentUser: User | null;
  initialPosts: Post[];
  initialPagination: FeedPagination;
};

export default function FeedPostsClient({
  currentUser,
  initialPosts,
  initialPagination,
}: FeedPostsClientProps) {
  const [feedPosts, setFeedPosts] = useState<Post[]>(initialPosts);
  const [pagination, setPagination] = useState<FeedPagination>(initialPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasMorePosts = pagination.hasMore;
  const showLoginDialog = usePostUIStore((s) => s.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMorePosts) {
      return;
    }

    setIsLoadingMore(true);

    const nextPage = pagination.page + 1;
    const result = await fetchPosts(nextPage, pagination.limit || FEED_PAGE_SIZE);

    if (!result.ok) {
      toast.error("Unable to load more posts.");
      setIsLoadingMore(false);
      return;
    }

    setFeedPosts((prev) => {
      const seen = new Set(prev.map((post) => post.id));
      const merged = [...prev];
      for (const post of result.data.posts) {
        if (!seen.has(post.id)) {
          merged.push(post);
          seen.add(post.id);
        }
      }
      return merged;
    });
    setPagination(result.data.pagination);
    setIsLoadingMore(false);
  }, [hasMorePosts, isLoadingMore, pagination]);

  return (
    <>
      {currentUser ? <FeedComposer currentUser={currentUser} /> : null}

      <div className="space-y-6">
        {feedPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {hasMorePosts ? (
          <div className="flex flex-col items-center gap-3 pt-2">
            {isLoadingMore ? (
              <div aria-live="polite" className="inline-flex items-center justify-center">
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
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

      <PostDetailModal />
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </>
  );
}
