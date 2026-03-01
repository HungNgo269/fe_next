"use client";

import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import RightSidebar from "@/app/components/layout/RightSidebar";
import { useFeedQuery } from "@/app/feature/post/hooks/useFeedQuery";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { usePostDetailModal } from "@/app/feature/post/hooks/usePostDetailModal";
import FeedComposer from "@/app/feature/post/components/FeedComposer";
import FeedStories from "@/app/feature/post/components/FeedStories";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import type { Post } from "@/app/feature/post/types/api.types";

export default function Home() {
  const { data, isLoading, error } = useFeedQuery();
  const showLoginDialog = usePostUIStore((s) => s.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const openModal = usePostDetailModal((s) => s.openModal);

  const currentUser = data?.currentUser ?? null;
  const posts: Post[] = data?.posts ?? [];
  const feedError = error?.message ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative grid min-w-0 w-full grid-cols-12 gap-6 px-4 pb-24 pt-10 sm:px-6 lg:pb-16">
        <div className="lg:col-span-2"></div>

        <section className="col-span-12 min-w-0 space-y-6 lg:col-span-6">
          {isLoading && null}
          {feedError ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
              {feedError}
            </div>
          ) : null}

          <FeedStories />

          {currentUser ? <FeedComposer currentUser={currentUser} /> : null}

          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onOpenDetail={openModal}
              />
            ))}
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
