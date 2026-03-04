"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PostComment } from "../../types/api.types";


type ModalCommentDataContextValue = {
  comment: PostComment;
  canEditComment: boolean;
  canDeleteComment: boolean;
};

const ModalCommentDataContext =
  createContext<ModalCommentDataContextValue | null>(null);

export function useModalCommentDataContext() {
  const context = useContext(ModalCommentDataContext);
  if (!context) {
    throw new Error(
      "useModalCommentDataContext must be used within ModalCommentItemProvider",
    );
  }
  return context;
}


type ModalCommentEditContextValue = {
  editingText: string;
  setEditingText: (value: string) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
};

const ModalCommentEditContext =
  createContext<ModalCommentEditContextValue | null>(null);

export function useModalCommentEditContext() {
  const context = useContext(ModalCommentEditContext);
  if (!context) {
    throw new Error(
      "useModalCommentEditContext must be used within ModalCommentItemProvider",
    );
  }
  return context;
}


type ModalCommentReplyContextValue = {
  replyText: string;
  setReplyText: (value: string) => void;
  submitReply: () => void;
  cancelReply: () => void;
};

const ModalCommentReplyContext =
  createContext<ModalCommentReplyContextValue | null>(null);

export function useModalCommentReplyContext() {
  const context = useContext(ModalCommentReplyContext);
  if (!context) {
    throw new Error(
      "useModalCommentReplyContext must be used within ModalCommentItemProvider",
    );
  }
  return context;
}


type ModalCommentActionsContextValue = {
  startEdit: () => void;
  deleteComment: () => void;
  reportComment: () => void;
};

const ModalCommentActionsContext =
  createContext<ModalCommentActionsContextValue | null>(null);

export function useModalCommentActionsContext() {
  const context = useContext(ModalCommentActionsContext);
  if (!context) {
    throw new Error(
      "useModalCommentActionsContext must be used within ModalCommentItemProvider",
    );
  }
  return context;
}


type ModalCommentItemProviderProps = {
  value: ModalCommentDataContextValue &
    ModalCommentEditContextValue &
    ModalCommentReplyContextValue &
    ModalCommentActionsContextValue;
  children: ReactNode;
};

export function ModalCommentItemProvider({
  value,
  children,
}: ModalCommentItemProviderProps) {
  const dataValue: ModalCommentDataContextValue = useMemo(
    () => ({
      comment: value.comment,
      canEditComment: value.canEditComment,
      canDeleteComment: value.canDeleteComment,
    }),
    [value.comment, value.canEditComment, value.canDeleteComment],
  );

  const editValue: ModalCommentEditContextValue = useMemo(
    () => ({
      editingText: value.editingText,
      setEditingText: value.setEditingText,
      saveEdit: value.saveEdit,
      cancelEdit: value.cancelEdit,
    }),
    [value.editingText, value.setEditingText, value.saveEdit, value.cancelEdit],
  );

  const replyValue: ModalCommentReplyContextValue = useMemo(
    () => ({
      replyText: value.replyText,
      setReplyText: value.setReplyText,
      submitReply: value.submitReply,
      cancelReply: value.cancelReply,
    }),
    [value.replyText, value.setReplyText, value.submitReply, value.cancelReply],
  );

  const actionsValue: ModalCommentActionsContextValue = useMemo(
    () => ({
      startEdit: value.startEdit,
      deleteComment: value.deleteComment,
      reportComment: value.reportComment,
    }),
    [value.startEdit, value.deleteComment, value.reportComment],
  );

  return (
    <ModalCommentDataContext.Provider value={dataValue}>
      <ModalCommentEditContext.Provider value={editValue}>
        <ModalCommentReplyContext.Provider value={replyValue}>
          <ModalCommentActionsContext.Provider value={actionsValue}>
            {children}
          </ModalCommentActionsContext.Provider>
        </ModalCommentReplyContext.Provider>
      </ModalCommentEditContext.Provider>
    </ModalCommentDataContext.Provider>
  );
}
