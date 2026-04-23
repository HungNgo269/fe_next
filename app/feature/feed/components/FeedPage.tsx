import { Suspense } from "react";
import FeedStoriesServer from "@/app/feature/feed/components/FeedStoriesServer";
import FeedPostsClient from "@/app/feature/feed/components/FeedPostsClient";
import FeedSuggestionsServer from "@/app/feature/feed/components/FeedSuggestionsServer";
import { fetchFeedPostsOnlySsr } from "@/app/feature/feed/api/feedApi.server";
import FeedStoriesSkeleton from "@/app/feature/feed/skeleton/FeedStoriesSkeleton";
import FeedComposerSkeleton from "@/app/feature/feed/skeleton/FeedComposerSkeleton";
import FeedPostListSkeleton from "@/app/feature/feed/skeleton/FeedPostListSkeleton";
import SuggestionListSkeleton from "@/app/feature/suggestion/skeleton/SuggestionListSkeleton";
import AppErrorBoundary from "@/app/share/components/AppErrorBoundary";

function FeedPostsSectionFallback() {
  return (
    <div className="space-y-6">
      <FeedComposerSkeleton />
      <FeedPostListSkeleton count={3} />
    </div>
  );
}

function FeedServerSectionErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-destructive/30 bg-destructive/10 p-5 text-foreground shadow-soft">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground-muted">
          Section unavailable
        </p>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-foreground-muted">{message}</p>
      </div>
    </section>
  );
}

async function SafeFeedStoriesSection() {
  try {
    return await FeedStoriesServer();
  } catch (error) {
    console.error("[ServerSection:feed-stories]", error);
    return (
      <FeedServerSectionErrorState
        title="Stories are unavailable"
        message="Posts and suggestions can still be used while stories recover."
      />
    );
  }
}

async function SafeFeedSuggestionsSection() {
  try {
    return await FeedSuggestionsServer();
  } catch (error) {
    console.error("[ServerSection:feed-suggestions]", error);
    return (
      <FeedServerSectionErrorState
        title="Suggestions are unavailable"
        message="Your feed remains usable while this sidebar section is retried later."
      />
    );
  }
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
              <SafeFeedStoriesSection />
            </Suspense>
          </div>

          <div id="posts">
            <Suspense fallback={<FeedPostsSectionFallback />}>
              <AppErrorBoundary
                boundaryName="feed-posts-section"
                title="The feed is temporarily unavailable"
                message="Stories and suggestions are still available. Retry this section to continue browsing posts."
              >
                <FeedPostsClient
                  initialPagination={feedPostsData.pagination}
                  initialPosts={feedPostsData.posts}
                  feedError={feedPostsData.feedError}
                />
              </AppErrorBoundary>
            </Suspense>
          </div>
        </section>

        <aside className="w-full space-y-6 lg:w-[320px] lg:flex-none" id="suggestions">
          <Suspense fallback={<SuggestionListSkeleton count={3} />}>
            <SafeFeedSuggestionsSection />
          </Suspense>
        </aside>
      </main>
    </div>
  );
}

