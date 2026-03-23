"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getFeedPostsFromCache } from "@/app/feature/feed/queries/feed.cache";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import type { Post } from "../types/api.types";
import { createShareRequest } from "../api/postShareApi";

export function usePostShareMutation(postId: string) {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const currentUser = toAvatarFromProfile(authProfile);
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const shareToProfileMutation = useMutation({
    mutationFn: () => createShareRequest(postId),
    onSuccess: (result) => {
      if (!result.ok || !currentUser) return;
      const sourcePost = getFeedPostsFromCache(queryClient).find(
          (item) => item.id === postId || item.sourcePostId === postId,
        );
      if (!sourcePost) return;

      const sharedPost: Post = {
        id: result.data.id,
        sourcePostId: postId,
        content: sourcePost.content,
        mediaUrls: sourcePost.mediaUrls,
        createdAt: result.data.createdAt,
        sharedAt: result.data.createdAt,
        sharedBy: {
          id: currentUser.id,
          handle: currentUser.handle,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
        },
        author: sourcePost.author,
        commentsCount: sourcePost.commentsCount,
        sharesCount: sourcePost.sharesCount,
        likesCount: sourcePost.likesCount,
        likedByMe: sourcePost.likedByMe,
      };
      cache.prependProfilePost(sharedPost);
    },
  });

  const handleShareToProfile = useCallback(() => {
    runIfAuth(() => shareToProfileMutation.mutate());
  }, [runIfAuth, shareToProfileMutation]);

  const handleCopyShareLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/posts/${postId}`;

    if (navigator.share) {
      await navigator.share({ url: shareUrl });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    }
  }, [postId]);

  return {
    isSharingToProfile: shareToProfileMutation.isPending,
    handleShareToProfile,
    handleCopyShareLink,
  };
}

