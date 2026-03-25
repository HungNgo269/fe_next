"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function NotificationPanelSkeleton() {
  return (
    <div aria-hidden="true" className="h-full w-full bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <SkeletonBlock className="h-5 w-28 rounded-full" />
        <SkeletonBlock className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-5 px-2.5 py-3 sm:px-3">
        {Array.from({ length: 4 }, (_, idx) => (
          <div
            key={`notification-skeleton-${idx}`}
            className="rounded-xl border border-border/60 bg-surface-hover/40 p-3"
          >
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-3.5 w-40 rounded-full" />
                <SkeletonBlock className="h-3 w-32 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
