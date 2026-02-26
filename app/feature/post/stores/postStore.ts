"use client";

import { create } from "zustand";


type PostUIState = {
  editingPostId: string | null;
  editingText: string;
  startEditing: (postId: string, text: string) => void;
  setEditingText: (text: string) => void;
  clearEditing: () => void;
  commentDrafts: Record<string, string>;
  setCommentDraft: (postId: string, value: string) => void;
  composerText: string;
  setComposerText: (value: string) => void;
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
};

export const usePostUIStore = create<PostUIState>((set) => ({
  editingPostId: null,
  editingText: "",
  startEditing: (postId, text) =>
    set({ editingPostId: postId, editingText: text }),
  setEditingText: (text) => set({ editingText: text }),
  clearEditing: () => set({ editingPostId: null, editingText: "" }),
  commentDrafts: {},
  setCommentDraft: (postId, value) =>
    set((state) => ({
      commentDrafts: { ...state.commentDrafts, [postId]: value },
    })),
  composerText: "",
  setComposerText: (value) => set({ composerText: value }),
  showLoginDialog: false,
  setShowLoginDialog: (show) => set({ showLoginDialog: show }),
}));
