"use client";

import { useMemo, useRef } from "react";
import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import { useFeedQuery } from "@/app/feature/feed/hooks/useFeedQuery";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import FeedComposer from "@/app/feature/feed/components/FeedComposer";
import PostCard from "@/app/feature/post/components/PostCard";
import PostDetailModal from "@/app/feature/post/components/PostDetailModal";
import type { Post } from "@/app/feature/post/types/api.types";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "@/app/share/stores/appSessionStore";
import { useInfiniteScrollTrigger } from "@/app/share/hooks/useInfiniteScrollTrigger";
import { Loader2 } from "lucide-react";
import { STORY_THEMES, STORY_TITLES } from "@/app/feature/story/data/story";
import type { StoryData } from "@/app/feature/story/types/story";
import Link from "next/link";
import Image from "next/image";
import SuggestionList from "@/app/feature/suggestion/components/SuggestionList";
import { useSuggestedUsers } from "@/app/feature/suggestion/hooks/useSuggestedUsers";

export default function FeedPageClient() {
  const storiesSectionRef = useRef<HTMLDivElement | null>(null);
  const postComposerRef = useRef<HTMLDivElement | null>(null);
  const postsSectionRef = useRef<HTMLDivElement | null>(null);
  const {
    data,
    error,
    posts,
    hasMorePosts,
    isLoadingMore,
    postsError,
    handleLoadMore,
  } = useFeedQuery();
  const { users: suggestedUsers, suggestions } = useSuggestedUsers();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const showLoginDialog = usePostUIStore((s) => s.showLoginDialog);
  const setShowLoginDialog = usePostUIStore((s) => s.setShowLoginDialog);
  const scrollToSection = (section: "stories" | "post" | "posts") => {
    const target =
      section === "stories"
        ? storiesSectionRef.current
        : section === "post"
          ? postComposerRef.current
          : postsSectionRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const loadMoreSentinelRef = useInfiniteScrollTrigger({
    hasMore: hasMorePosts,
    isLoading: isLoadingMore,
    onLoadMore: handleLoadMore,
  });

  const currentUser = data?.currentUser ?? toAvatarFromProfile(authProfile);
  const currentUserId = currentUser?.id;
  const feedPosts: Post[] = posts ?? [];
  const feedError = error?.message ?? "";
  const stories = useMemo<StoryData[]>(
    () =>
      suggestedUsers
        .filter((u) => u.id !== currentUserId)
        .slice(0, 4)
        .map((user, i) => ({
          id: `story-${user.id}`,
          title: STORY_TITLES[i % STORY_TITLES.length],
          author: user,
          theme: STORY_THEMES[i % STORY_THEMES.length],
        })),
    [currentUserId, suggestedUsers],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto flex min-w-0 w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-8 lg:py-10">
        <section className="min-w-0 w-full space-y-6 lg:w-[630px] lg:flex-none">
          <div className="sticky top-2 z-20 rounded-full border border-border/70 bg-background/90 px-2 py-1 backdrop-blur lg:hidden">
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
                onClick={() => scrollToSection("stories")}
              >
                Stories
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
                onClick={() => scrollToSection("post")}
              >
                Post
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover"
                onClick={() => scrollToSection("posts")}
              >
                Posts
              </button>
            </div>
          </div>

          {feedError ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
              {feedError}
            </div>
          ) : null}

          <div ref={storiesSectionRef}>
            {stories.length > 0 ? (
              <div className=" min-w-0 ">
                <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-2">
                  {stories.map((story) => (
                    <Link
                      className="relative flex w-20 cursor-pointer flex-col justify-between  text-center "
                      key={story.id}
                      href={`/profile/${story.author.handle || story.author.id}`}
                    >
                      <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full">
                        <Image
                          alt={story.author.name ?? "story avatar"}
                          src={story.author.avatarUrl ?? ""}
                          fill
                          sizes="80px"
                        />
                      </div>
                      <p className="text-xs text-foreground text-center  truncate max-w-20">
                        {story.author.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div ref={postComposerRef}>
            {currentUser ? <FeedComposer currentUser={currentUser} /> : null}
          </div>

          <div ref={postsSectionRef} className="space-y-6">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
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

        <aside className="w-full space-y-6 lg:w-[320px] lg:flex-none">
          <SuggestionList suggestions={suggestions} />
        </aside>
      </main>

      <PostDetailModal />

      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
      />
    </div>
  );
}
