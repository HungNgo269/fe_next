"use client";

import SkeletonBlock from "@/app/share/skeleton/SkeletonBlock";

export default function EditProfilePageSkeleton() {
  return (
    <main aria-hidden="true" className="relative mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-12 sm:px-6">
      <header className="flex items-center justify-between gap-2">
        <SkeletonBlock className="h-8 w-40 rounded-full" />
      </header>

      <section className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-24 w-24 rounded-3xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-40 rounded-full" />
            <SkeletonBlock className="h-4 w-28 rounded-full" />
            <SkeletonBlock className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur sm:p-6">
        <SkeletonBlock className="h-5 w-44 rounded-full" />
        <div className="space-y-3">
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
          <SkeletonBlock className="h-28 w-full rounded-2xl" />
          <SkeletonBlock className="h-12 w-full rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <SkeletonBlock className="h-10 w-28 rounded-xl" />
        </div>
      </section>
    </main>
  );
}
