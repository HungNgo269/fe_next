"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function UserListModalSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <SkeletonBlock className="h-10 w-full rounded-md" />
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, idx) => (
          <div key={`user-list-skeleton-${idx}`} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3.5 w-28 rounded-full" />
                <SkeletonBlock className="h-3 w-20 rounded-full" />
              </div>
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
