import { useState } from "react";
import {
  createCommentRequest,
  deleteCommentRequest,
  updateCommentRequest,
} from "../api/feedApi";
import type { AvatarInfo, PostData } from "../types/feed";

export type UseFeedCommentsResult = {
  commentDrafts: Record<string, string>;
  handleCommentDraft: (postId: string, value: string) => void;
  handleAddComment: (postId: string) => Promise<void>;
  handleSaveCommentEdit: (postId: string, commentId: string, content: string) => Promise<boolean>;
  handleDeleteComment: (postId: string, commentId: string) => Promise<boolean>;
  handleReportContent: (contentType: "post" | "comment") => void;
};

type UseFeedCommentsParams = {
  currentUser: AvatarInfo;
  posts: PostData[];
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
  setFeedError: React.Dispatch<React.SetStateAction<string>>;
  /** When provided, unauthenticated users are prompted to log in. */
  isAuthenticated?: boolean;
  requireAuth?: () => void;
  /** Ownership check — defaults to comparing `currentUser.id === ownerId` when omitted. */
  isOwnerById?: (ownerId?: string) => boolean;
};

export function useFeedComments({
  currentUser,
  posts,
  setPosts,
  setFeedError,
  isAuthenticated = true,
  requireAuth,
  isOwnerById,
}: UseFeedCommentsParams): UseFeedCommentsResult {
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const checkOwner = (ownerId?: string) =>
    isOwnerById ? isOwnerById(ownerId) : Boolean(ownerId) && ownerId === currentUser.id;

  const handleCommentDraft = (postId: string, value: string) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    const draft = (commentDrafts[postId] ?? "").trim();
    if (!draft) return;

    const result = await createCommentRequest(postId, currentUser.id, draft);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to add comment.");
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                { id: result.data.id, author: currentUser, text: draft, time: "Just now" },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleSaveCommentEdit = async (
    postId: string,
    commentId: string,
    content: string,
  ): Promise<boolean> => {
    if (!isAuthenticated) { requireAuth?.(); return false; }

    const trimmed = content.trim();
    if (!trimmed) return false;

    const targetPost = posts.find((post) => post.id === postId);
    const targetComment = targetPost?.comments.find((c) => c.id === commentId);
    if (!targetComment || !checkOwner(targetComment.author.id)) {
      setFeedError("You can only edit your own comment.");
      return false;
    }

    const result = await updateCommentRequest(commentId, trimmed);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to update comment.");
      return false;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId ? { ...c, text: trimmed, time: "Just now" } : c,
              ),
            }
          : post,
      ),
    );
    return true;
  };

  const handleDeleteComment = async (
    postId: string,
    commentId: string,
  ): Promise<boolean> => {
    if (!isAuthenticated) { requireAuth?.(); return false; }

    const targetPost = posts.find((post) => post.id === postId);
    const targetComment = targetPost?.comments.find((c) => c.id === commentId);
    if (!targetComment || !checkOwner(targetComment.author.id)) {
      setFeedError("You can only delete your own comment.");
      return false;
    }

    const result = await deleteCommentRequest(commentId);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to delete comment.");
      return false;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments.filter((c) => c.id !== commentId) }
          : post,
      ),
    );
    return true;
  };

  const handleReportContent = (contentType: "post" | "comment") => {
    setFeedError(
      contentType === "post"
        ? "Report submitted for this post (demo)."
        : "Report submitted for this comment (demo).",
    );
  };

  return {
    commentDrafts,
    handleCommentDraft,
    handleAddComment,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportContent,
  };
}
