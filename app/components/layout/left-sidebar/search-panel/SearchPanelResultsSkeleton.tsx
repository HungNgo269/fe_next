"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function SearchPanelResultsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-5">
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <SkeletonBlock className="h-3 w-20 rounded-full" />
          <SkeletonBlock className="h-3 w-8 rounded-full" />
        </div>
        {Array.from({ length: 3 }, (_, idx) => (
          <div key={`search-user-skeleton-${idx}`} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-28 rounded-full" />
              <SkeletonBlock className="h-3 w-40 rounded-full" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <SkeletonBlock className="h-3 w-16 rounded-full" />
          <SkeletonBlock className="h-3 w-8 rounded-full" />
        </div>
        {Array.from({ length: 3 }, (_, idx) => (
          <div key={`search-post-skeleton-${idx}`} className="flex items-start gap-3 rounded-xl px-2.5 py-2">
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-full rounded-full" />
              <SkeletonBlock className="h-3 w-3/4 rounded-full" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
