import { Suspense } from "react";
import FeedStoriesServer from "@/app/feature/feed/components/FeedStoriesServer";
import FeedPostsClient from "@/app/feature/feed/components/FeedPostsClient";
import FeedSuggestionsServer from "@/app/feature/feed/components/FeedSuggestionsServer";
import { fetchFeedPostsOnlySsr } from "@/app/feature/feed/api/feedApi.server";
import FeedStoriesSkeleton from "@/app/feature/feed/skeleton/FeedStoriesSkeleton";
import FeedComposerSkeleton from "@/app/feature/feed/skeleton/FeedComposerSkeleton";
import FeedPostListSkeleton from "@/app/feature/feed/skeleton/FeedPostListSkeleton";
import SuggestionListSkeleton from "@/app/feature/suggestion/skeleton/SuggestionListSkeleton";

function FeedPostsSectionFallback() {
  return (
    <div className="space-y-6">
      <FeedComposerSkeleton />
      <FeedPostListSkeleton count={3} />
    </div>
  );
}

export default async function FeedPage() {
  const feedPostsData = await fetchFeedPostsOnlySsr();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto flex min-w-0 w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-8 lg:py-10">
        <section className="min-w-0 w-full space-y-6 lg:w-[630px] lg:flex-none">
          <nav className="sticky top-2 z-20 rounded-full border border-border/70 bg-background/90 px-2 py-1 backdrop-blur lg:hidden">
            <div className="grid grid-cols-3 gap-1">
              <a
                className="rounded-full px-3 py-1.5 text-center text-xs font-semibold text-foreground hover:bg-surface-hover"
                href="#stories"
              >
                Stories
              </a>
              <a
                className="rounded-full px-3 py-1.5 text-center text-xs font-semibold text-foreground hover:bg-surface-hover"
                href="#posts"
              >
                Posts
              </a>
              <a
                className="rounded-full px-3 py-1.5 text-center text-xs font-semibold text-foreground hover:bg-surface-hover"
                href="#suggestions"
              >
                Suggest
              </a>
            </div>
          </nav>

          <div id="stories">
            <Suspense fallback={<FeedStoriesSkeleton count={4} />}>
              <FeedStoriesServer />
            </Suspense>
          </div>

          <div id="posts">
            <Suspense fallback={<FeedPostsSectionFallback />}>
              <FeedPostsClient
                initialPagination={feedPostsData.pagination}
                initialPosts={feedPostsData.posts}
                feedError={feedPostsData.feedError}
              />
            </Suspense>
          </div>
        </section>

        <aside className="w-full space-y-6 lg:w-[320px] lg:flex-none" id="suggestions">
          <Suspense fallback={<SuggestionListSkeleton count={3} />}>
            <FeedSuggestionsServer />
          </Suspense>
        </aside>
      </main>
    </div>
  );
}

