"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PostComment } from "../../types/api.types";

type ModalCommentItemContextValue = {
  comment: PostComment;
  canEditComment: boolean;
  canDeleteComment: boolean;
  editingText: string;
  setEditingText: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  replyText: string;
  setReplyText: (value: string) => void;
  submitReply: () => void;
  cancelReply: () => void;
  startEdit: () => void;
  deleteComment: () => void;
  reportComment: () => void;
};

const ModalCommentItemContext =
  createContext<ModalCommentItemContextValue | null>(null);

export function ModalCommentItemProvider({
  value,
  children,
}: {
  value: ModalCommentItemContextValue;
  children: ReactNode;
}) {
  return (
    <ModalCommentItemContext.Provider value={value}>
      {children}
    </ModalCommentItemContext.Provider>
  );
}

export function useModalCommentItemContext() {
  const context = useContext(ModalCommentItemContext);
  if (!context) {
    throw new Error(
      "useModalCommentItemContext must be used within ModalCommentItemProvider",
    );
  }
  return context;
}
