"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

type FeedStoriesSkeletonProps = {
  count?: number;
};

export default function FeedStoriesSkeleton({
  count = 4,
}: FeedStoriesSkeletonProps) {
  return (
    <div aria-hidden="true" className="min-w-0">
      <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-2">
        {Array.from({ length: count }, (_, idx) => (
          <div
            className="relative flex w-20 flex-none flex-col items-center text-center"
            key={`feed-story-skeleton-${idx}`}
          >
            <SkeletonBlock className="mb-3 h-20 w-20 rounded-full" />
            <SkeletonBlock className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
