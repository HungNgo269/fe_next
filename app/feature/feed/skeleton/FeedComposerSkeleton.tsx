"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function FeedComposerSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-md p-5">
      <div className="flex items-start gap-4">
        <SkeletonBlock className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-2/3 rounded-full sm:w-1/2" />
          <SkeletonBlock className="h-24 w-full rounded-2xl" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <SkeletonBlock className="h-8 w-28 rounded-full" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-3 w-12 rounded-full" />
          <SkeletonBlock className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
