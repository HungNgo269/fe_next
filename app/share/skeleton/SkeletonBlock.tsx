"use client";

export default function SkeletonBlock({ className }: { className: string }) {
  return <div className={`ui-skeleton-shimmer animate-pulse-soft ${className}`} />;
}

