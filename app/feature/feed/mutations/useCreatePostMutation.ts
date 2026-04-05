"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";
import { createPostAction } from "@/app/feature/post/actions/post.actions";
import type { Post } from "@/app/feature/post/types/api.types";
import { useRequireAuthAction } from "@/app/feature/post/hooks/useRequireAuthAction";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { useUser } from "@/app/share/providers/UserProvider";
import { feedQueryKeys } from "../queries/feed.query-keys";
import {
  getApiResultMessage,
  getApiResultStatus,
  isForbiddenStatus,
  isUnauthenticatedStatus,
} from "@/app/share/utils/api-result";

export function useCreatePostMutation() {
  const currentUser = useUser();
  const queryClient = useQueryClient();
  const { runIfAuth } = useRequireAuthAction();
  const cache = useFeedCacheUpdater();

  const createMutation = useMutation({
    mutationFn: (payload: { content: string; mediaFiles: File[] }) =>
      createPostAction(payload.content, payload.mediaFiles),
    onSuccess: async (result, payload) => {
      if (!result.ok || !currentUser) return;

      const newPost: Post = {
        id: result.data.id,
        author: {
          id: currentUser.id,
          handle: currentUser.handle ?? null,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl ?? undefined,
          gender: currentUser.gender,
        },
        createdAt: new Date().toISOString(),
        content: payload.content.trim(),
        likesCount: 0,
        likedByMe: false,
        commentsCount: 0,
        sharesCount: 0,
        mediaUrls: result.data.mediaUrls ?? [],
      };

      cache.prependPost(newPost);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.all }),
      ]);
    },
  });

  const handleCreatePost = useCallback(
    (content: string, mediaFiles: File[] = []) => {
      runIfAuth(() => {
        const trimmed = content.trim();
        if (!trimmed && mediaFiles.length === 0) return;
        createMutation.mutate(
          { content: trimmed, mediaFiles },
          {
            onSuccess: (result) => {
              if (!result.ok) {
                const status = getApiResultStatus(result);
                toast.error(
                  isForbiddenStatus(status)
                    ? "You do not have permission to create a post."
                    : isUnauthenticatedStatus(status)
                      ? "Your session has expired. Please sign in again."
                      : getApiResultMessage(result, "Unable to create post."),
                );
              }
            },
          },
        );
      });
    },
    [createMutation, runIfAuth],
  );

  return { handleCreatePost, isCreating: createMutation.isPending };
}
