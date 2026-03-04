"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Post, PostComment } from "../../types/api.types";

type ModalPostContentContextValue = {
  post: Post;
  postId: string;
  profileKey: string;
  userHandle: string;
  onClose: () => void;
  isOwner: boolean;
  isEditing: boolean;
  editingText: string;
  setEditingText: (value: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleStartEdit: () => void;
  handleDeletePostAndClose: () => void;
  commentsLoading: boolean;
  visibleRootComments: PostComment[];
  hasMoreRootComments: boolean;
  showMoreRootComments: () => void;
  likesCount: number;
  likedByMe?: boolean;
  totalComments: number;
  handleToggleLike: () => void;
  handleShare: () => void;
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  handleAddComment: () => void;
};

const ModalPostContentContext =
  createContext<ModalPostContentContextValue | null>(null);

export function ModalPostContentProvider({
  value,
  children,
}: {
  value: ModalPostContentContextValue;
  children: ReactNode;
}) {
  return (
    <ModalPostContentContext.Provider value={value}>
      {children}
    </ModalPostContentContext.Provider>
  );
}

export function useModalPostContentContext() {
  const context = useContext(ModalPostContentContext);
  if (!context) {
    throw new Error(
      "useModalPostContentContext must be used within ModalPostContentProvider",
    );
  }
  return context;
}
