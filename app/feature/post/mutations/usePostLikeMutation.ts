"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { createLikeAction, deleteLikeAction } from "../actions/post.actions";
import { findPostInCaches } from "../utils/postCache";

export function usePostLikeMutation(postId: string, currentLiked?: boolean) {
  const queryClient = useQueryClient();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();
  const DEBOUNCE_MS = 1000;
  const confirmedLikedRef = useRef<boolean>(currentLiked ?? false);
  const optimisticLikedRef = useRef<boolean>(currentLiked ?? false);
  const desiredLikedRef = useRef<boolean>(currentLiked ?? false);
  const debounceTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const needsFlushAfterInFlightRef = useRef(false);

  const readCurrentLiked = useCallback(() => {
    const post = findPostInCaches(queryClient, postId);
    return currentLiked ?? post?.likedByMe ?? false;
  }, [currentLiked, postId, queryClient]);

  useEffect(() => {
    const latestLiked = readCurrentLiked();
    if (!inFlightRef.current) {
      confirmedLikedRef.current = latestLiked;
    }
    optimisticLikedRef.current = latestLiked;
    desiredLikedRef.current = latestLiked;
  }, [readCurrentLiked]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    },
    [],
  );

  const likeMutation = useMutation({
    mutationFn: async (variables: { nextLiked: boolean }) => {
      if (!variables.nextLiked) {
        const result = await deleteLikeAction(postId);
        if (!result.ok && result.error.status !== 404) {
          throw new Error(result.error.messages[0] ?? "Unable to unlike.");
        }
        return;
      }

      const result = await createLikeAction(postId);
      if (!result.ok) {
        if (result.error.status === 409) return;
        throw new Error(result.error.messages[0] ?? "Unable to like.");
      }
    },
    onSuccess: (_data, variables) => {
      confirmedLikedRef.current = variables.nextLiked;
    },
    onError: () => {
      optimisticLikedRef.current = confirmedLikedRef.current;
      desiredLikedRef.current = confirmedLikedRef.current;
      cache.toggleLike(postId, confirmedLikedRef.current);
    },
    onSettled: () => {
      inFlightRef.current = false;
      if (!needsFlushAfterInFlightRef.current) return;
      needsFlushAfterInFlightRef.current = false;
      const target = desiredLikedRef.current;
      if (target === confirmedLikedRef.current) return;
      inFlightRef.current = true;
      likeMutation.mutate({ nextLiked: target });
    },
  });

  const flushDesiredLike = useCallback(() => {
    const target = desiredLikedRef.current;
    if (target === confirmedLikedRef.current) return;
    if (inFlightRef.current || likeMutation.isPending) {
      needsFlushAfterInFlightRef.current = true;
      return;
    }
    inFlightRef.current = true;
    likeMutation.mutate({ nextLiked: target });
  }, [likeMutation]);

  const scheduleFlush = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      flushDesiredLike();
    }, DEBOUNCE_MS);
  }, [DEBOUNCE_MS, flushDesiredLike]);

  const handleToggleLike = useCallback(() => {
    runIfAuth(() => {
      const baseLiked = optimisticLikedRef.current;
      const nextLiked = !baseLiked;
      optimisticLikedRef.current = nextLiked;
      desiredLikedRef.current = nextLiked;
      cache.toggleLike(postId, nextLiked);
      scheduleFlush();
    });
  }, [cache, postId, runIfAuth, scheduleFlush]);

  return { handleToggleLike, isLiking: likeMutation.isPending };
}

