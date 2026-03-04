"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { FeedBootstrapData } from "../types/feed";
import { FEED_QUERY_KEY } from "./feedQueryKeys";
import { useRequireAuthAction } from "./useRequireAuthAction";
import {
  useAppSessionStore,
  toAvatarFromProfile,
} from "@/app/share/stores/appSessionStore";
import { useFeedCacheUpdater } from "./useFeedCacheUpdater";
import type { Post } from "../types/api.types";
import { createShareRequest } from "../api/postShareApi";

export function useSharePost(postId: string) {
  const queryClient = useQueryClient();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const currentUser = toAvatarFromProfile(authProfile);
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const shareToProfileMutation = useMutation({
    mutationFn: () => createShareRequest(postId),
    onSuccess: (result) => {
      if (!result.ok || !currentUser) return;
      const sourcePost = queryClient
        .getQueryData<FeedBootstrapData>(FEED_QUERY_KEY)
        ?.posts.find(
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
