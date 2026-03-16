"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function SuggestionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="rounded-md p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-32 rounded-full" />
          <SkeletonBlock className="h-3 w-40 rounded-full" />
        </div>
        <SkeletonBlock className="h-7 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: count }, (_, idx) => (
          <div className="flex items-center justify-between gap-3 py-3" key={`suggestion-skeleton-${idx}`}>
            <div className="flex min-w-0 items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3.5 w-28 rounded-full" />
                <SkeletonBlock className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="h-7 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

