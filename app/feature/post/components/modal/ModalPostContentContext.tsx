"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Post, PostComment } from "../../types/api.types";


type ModalPostDataContextValue = {
  post: Post;
  postId: string;
  profileKey: string;
  userHandle: string;
  isOwner: boolean;
  likesCount: number;
  likedByMe?: boolean;
  totalComments: number;
  commentsLoading: boolean;
  visibleRootComments: PostComment[];
  hasMoreRootComments: boolean;
  showMoreRootComments: () => void;
};

const ModalPostDataContext =
  createContext<ModalPostDataContextValue | null>(null);

export function useModalPostDataContext() {
  const context = useContext(ModalPostDataContext);
  if (!context) {
    throw new Error(
      "useModalPostDataContext must be used within ModalPostContentProvider",
    );
  }
  return context;
}


type ModalPostEditContextValue = {
  isEditing: boolean;
  editingText: string;
  setEditingText: (value: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleStartEdit: () => void;
};

const ModalPostEditContext =
  createContext<ModalPostEditContextValue | null>(null);

export function useModalPostEditContext() {
  const context = useContext(ModalPostEditContext);
  if (!context) {
    throw new Error(
      "useModalPostEditContext must be used within ModalPostContentProvider",
    );
  }
  return context;
}


type ModalPostActionsContextValue = {
  onClose: () => void;
  handleDeletePostAndClose: () => void;
  handleReportPost: (text?: string) => Promise<boolean>;
  isReportingPost: boolean;
  handleToggleLike: () => void;
  handleShare: () => void;
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  handleAddComment: () => void;
};

const ModalPostActionsContext =
  createContext<ModalPostActionsContextValue | null>(null);

export function useModalPostActionsContext() {
  const context = useContext(ModalPostActionsContext);
  if (!context) {
    throw new Error(
      "useModalPostActionsContext must be used within ModalPostContentProvider",
    );
  }
  return context;
}


type ModalPostContentProviderProps = {
  value: ModalPostDataContextValue &
    ModalPostEditContextValue &
    ModalPostActionsContextValue;
  children: ReactNode;
};

export function ModalPostContentProvider({
  value,
  children,
}: ModalPostContentProviderProps) {
  const dataValue: ModalPostDataContextValue = useMemo(
    () => ({
      post: value.post,
      postId: value.postId,
      profileKey: value.profileKey,
      userHandle: value.userHandle,
      isOwner: value.isOwner,
      likesCount: value.likesCount,
      likedByMe: value.likedByMe,
      totalComments: value.totalComments,
      commentsLoading: value.commentsLoading,
      visibleRootComments: value.visibleRootComments,
      hasMoreRootComments: value.hasMoreRootComments,
      showMoreRootComments: value.showMoreRootComments,
    }),
    [
      value.post,
      value.postId,
      value.profileKey,
      value.userHandle,
      value.isOwner,
      value.likesCount,
      value.likedByMe,
      value.totalComments,
      value.commentsLoading,
      value.visibleRootComments,
      value.hasMoreRootComments,
      value.showMoreRootComments,
    ],
  );

  const editValue: ModalPostEditContextValue = useMemo(
    () => ({
      isEditing: value.isEditing,
      editingText: value.editingText,
      setEditingText: value.setEditingText,
      handleSaveEdit: value.handleSaveEdit,
      handleCancelEdit: value.handleCancelEdit,
      handleStartEdit: value.handleStartEdit,
    }),
    [
      value.isEditing,
      value.editingText,
      value.setEditingText,
      value.handleSaveEdit,
      value.handleCancelEdit,
      value.handleStartEdit,
    ],
  );

  const actionsValue: ModalPostActionsContextValue = useMemo(
    () => ({
      onClose: value.onClose,
      handleDeletePostAndClose: value.handleDeletePostAndClose,
      handleReportPost: value.handleReportPost,
      isReportingPost: value.isReportingPost,
      handleToggleLike: value.handleToggleLike,
      handleShare: value.handleShare,
      commentDraft: value.commentDraft,
      setCommentDraft: value.setCommentDraft,
      handleAddComment: value.handleAddComment,
    }),
    [
      value.onClose,
      value.handleDeletePostAndClose,
      value.handleReportPost,
      value.isReportingPost,
      value.handleToggleLike,
      value.handleShare,
      value.commentDraft,
      value.setCommentDraft,
      value.handleAddComment,
    ],
  );

  return (
    <ModalPostDataContext.Provider value={dataValue}>
      <ModalPostEditContext.Provider value={editValue}>
        <ModalPostActionsContext.Provider value={actionsValue}>
          {children}
        </ModalPostActionsContext.Provider>
      </ModalPostEditContext.Provider>
    </ModalPostDataContext.Provider>
  );
}
