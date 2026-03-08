"use client";

import { create } from "zustand";
import type { Post } from "../types/api.types";

type PostDetailModalState = {
  selectedPost: Post | null;
  isUrlSynced: boolean;
  returnToPath: string | null;
  openModal: (post: Post, options?: { syncUrl?: boolean }) => void;
  closeModal: () => void;
  dismissModal: () => void;
};

export const usePostDetailModal = create<PostDetailModalState>((set) => ({
  selectedPost: null,
  isUrlSynced: false,
  returnToPath: null,
  openModal: (post, options) => {
    let returnToPath: string | null = null;
    if (options?.syncUrl && typeof window !== "undefined") {
      const interactionPostId = post.sourcePostId ?? post.id;
      const targetPath = `/posts/${interactionPostId}`;
      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentPath.startsWith("/profile")) {
        returnToPath = currentPath;
      } else {
        returnToPath = "/";
      }
      if (window.location.pathname !== targetPath) {
        window.history.pushState(
          { ...(window.history.state ?? {}), modalPostId: interactionPostId },
          "",
          targetPath,
        );
      }
    }
    set({
      selectedPost: post,
      isUrlSynced: Boolean(options?.syncUrl),
      returnToPath,
    });
  },
  closeModal: () => {
    if (typeof window !== "undefined") {
      const { isUrlSynced, returnToPath } = usePostDetailModal.getState();
      if (isUrlSynced && window.location.pathname.startsWith("/posts/")) {
        window.history.replaceState(
          { ...(window.history.state ?? {}), modalPostId: undefined },
          "",
          returnToPath ?? "/",
        );
      }
    }
    set({ selectedPost: null, isUrlSynced: false, returnToPath: null });
  },
  dismissModal: () =>
    set({ selectedPost: null, isUrlSynced: false, returnToPath: null }),
}));
