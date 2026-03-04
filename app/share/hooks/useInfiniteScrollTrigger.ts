"use client";

import { useCallback, useEffect, useRef } from "react";

type UseInfiniteScrollTriggerOptions = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void> | void;
  rootMargin?: string;
};

export function useInfiniteScrollTrigger({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "280px 0px",
}: UseInfiniteScrollTriggerOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || isLoading || !hasMore) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (!entry?.isIntersecting || isLoading || !hasMore) return;
          void onLoadMore();
        },
        { root: null, threshold: 0.1, rootMargin },
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoading, onLoadMore, rootMargin],
  );

  useEffect(
    () => () => {
      if (observerRef.current) observerRef.current.disconnect();
    },
    [],
  );

  return sentinelRef;
}
