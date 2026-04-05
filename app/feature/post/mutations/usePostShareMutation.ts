"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { useUser } from "@/app/share/providers/UserProvider";
import { getFeedPostsFromCache } from "@/app/feature/feed/queries/feed.cache";
import { createShareAction } from "../actions/post.actions";
import { useRequireAuthAction } from "../hooks/useRequireAuthAction";
import type { Post } from "../types/api.types";
import {
  getApiResultMessage,
  getApiResultStatus,
  isForbiddenStatus,
  isUnauthenticatedStatus,
} from "@/app/share/utils/api-result";

export function usePostShareMutation(postId: string) {
  const queryClient = useQueryClient();
  const currentUser = useUser();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const shareToProfileMutation = useMutation({
    mutationFn: () => createShareAction(postId),
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
    runIfAuth(async () => {
      const result = await shareToProfileMutation.mutateAsync();
      if (!result.ok) {
        const status = getApiResultStatus(result);
        toast.error(
          isForbiddenStatus(status)
            ? "You do not have permission to share this post."
            : isUnauthenticatedStatus(status)
              ? "Your session has expired. Please sign in again."
              : getApiResultMessage(result, "Unable to share post."),
        );
      }
    });
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
