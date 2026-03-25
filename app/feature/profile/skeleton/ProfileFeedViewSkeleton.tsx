"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function ProfileFeedViewSkeleton() {
  return (
    <main aria-hidden="true" className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
      <section className="rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-8">
        <SkeletonBlock className="h-40 w-full rounded-[1.75rem] sm:h-48" />
        <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <SkeletonBlock className="h-24 w-24 rounded-3xl border-4 border-background sm:h-28 sm:w-28" />
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-44 rounded-full sm:w-56" />
              <SkeletonBlock className="h-4 w-32 rounded-full sm:w-40" />
              <SkeletonBlock className="h-4 w-72 max-w-full rounded-full" />
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <SkeletonBlock className="h-10 flex-1 rounded-xl sm:w-36" />
            <SkeletonBlock className="h-10 flex-1 rounded-xl sm:w-36" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>
        <div className="rounded-md p-5">
          <div className="flex items-start gap-4">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3 rounded-full sm:w-1/2" />
              <SkeletonBlock className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }, (_, idx) => (
            <article key={`profile-feed-skeleton-${idx}`} className="rounded-md p-5">
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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
