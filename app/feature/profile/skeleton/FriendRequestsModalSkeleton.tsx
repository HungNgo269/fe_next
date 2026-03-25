"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function FriendRequestsModalSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      {Array.from({ length: 4 }, (_, idx) => (
        <div
          key={`friend-request-skeleton-${idx}`}
          className="rounded-xl border border-border/60 bg-surface-hover/40 p-3"
        >
          <div className="flex items-start gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-28 rounded-full" />
              <SkeletonBlock className="h-3 w-36 rounded-full" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <SkeletonBlock className="h-8 w-24 rounded-lg" />
            <SkeletonBlock className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
