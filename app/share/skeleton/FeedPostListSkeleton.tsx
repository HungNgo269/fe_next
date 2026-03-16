"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

type FeedPostListSkeletonProps = {
  count?: number;
};

function FeedPostCardSkeleton() {
  return (
    <article className="rounded-md p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3.5 w-40 rounded-full sm:w-52" />
            <SkeletonBlock className="h-3 w-28 rounded-full sm:w-36" />
          </div>
        </div>
        <SkeletonBlock className="h-8 w-8 rounded-full" />
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonBlock className="h-3.5 w-full rounded-full" />
        <SkeletonBlock className="h-3.5 w-5/6 rounded-full" />
        <SkeletonBlock className="h-3.5 w-2/3 rounded-full" />
      </div>

      <SkeletonBlock className="mt-4 h-56 w-full rounded-2xl sm:h-72" />

      <div className="pt-4">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonBlock className="h-8 w-full rounded-full" />
          <SkeletonBlock className="h-8 w-full rounded-full" />
          <SkeletonBlock className="h-8 w-full rounded-full" />
        </div>
      </div>
    </article>
  );
}

export default function FeedPostListSkeleton({
  count = 3,
}: FeedPostListSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-6">
      {Array.from({ length: count }, (_, idx) => (
        <FeedPostCardSkeleton key={`feed-post-skeleton-${idx}`} />
      ))}
    </div>
  );
}
