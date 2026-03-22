import type { Post, PostComment } from "../types/api.types";

export interface ModalPostDataContextValue {
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
}

export interface ModalPostEditContextValue {
  isEditing: boolean;
  editingText: string;
  setEditingText: (value: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleStartEdit: () => void;
}

export interface ModalPostActionsContextValue {
  onClose: () => void;
  handleDeletePostAndClose: () => void;
  handleReportPost: (text?: string) => Promise<boolean>;
  isReportingPost: boolean;
  handleToggleLike: () => void;
  handleShare: () => void;
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  handleAddComment: () => void;
}

export type ModalPostContentProviderValue = ModalPostDataContextValue &
  ModalPostEditContextValue &
  ModalPostActionsContextValue;
