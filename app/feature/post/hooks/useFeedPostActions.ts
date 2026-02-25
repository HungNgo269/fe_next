import { useState } from "react";
import {
  createPostRequest,
  deletePostRequest,
  updatePostRequest,
} from "../api/feedApi";
import type { AvatarInfo, PostData } from "../types/feed";

export type UseFeedPostActionsResult = {
  composerText: string;
  editingPostId: string | null;
  editingText: string;
  setEditingText: React.Dispatch<React.SetStateAction<string>>;
  handleComposerChange: (nextValue: string) => void;
  handleCreatePost: () => Promise<void>;
  handleStartEdit: (post: PostData) => void;
  handleSaveEdit: (postId: string) => Promise<void>;
  handleCancelEdit: () => void;
  handleDeletePost: (postId: string) => Promise<void>;
};

type UseFeedPostActionsParams = {
  currentUser: AvatarInfo;
  posts: PostData[];
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
  setFeedError: React.Dispatch<React.SetStateAction<string>>;
  /** When provided, unauthenticated users are prompted to log in. */
  isAuthenticated?: boolean;
  requireAuth?: () => void;
  /** Ownership check — defaults to comparing `currentUser.id === ownerId` when omitted. */
  isOwnerById?: (ownerId?: string) => boolean;
  /** Optional: update the total post count on create/delete (used by profile feed). */
  setTotalPosts?: React.Dispatch<React.SetStateAction<number>>;
  /** Optional: clean up like tracking when a post is deleted. */
  setMyLikeIdsByPostId?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export function useFeedPostActions({
  currentUser,
  posts,
  setPosts,
  setFeedError,
  isAuthenticated = true,
  requireAuth,
  isOwnerById,
  setTotalPosts,
  setMyLikeIdsByPostId,
}: UseFeedPostActionsParams): UseFeedPostActionsResult {
  const [composerText, setComposerText] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const checkOwner = (ownerId?: string) =>
    isOwnerById ? isOwnerById(ownerId) : Boolean(ownerId) && ownerId === currentUser.id;

  const handleComposerChange = (nextValue: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    setComposerText(nextValue);
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    const trimmed = composerText.trim();
    if (!trimmed) return;

    const result = await createPostRequest(trimmed, currentUser.id);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to create post.");
      return;
    }

    const newPost: PostData = {
      id: result.data.id,
      author: currentUser,
      time: "Just now",
      audience: "Public",
      content: trimmed,
      likes: 0,
      shares: 0,
      likedByMe: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setTotalPosts?.((prev) => prev + 1);
    setComposerText("");
  };

  const handleStartEdit = (post: PostData) => {
    if (!isAuthenticated || !checkOwner(post.author.id)) { requireAuth?.(); return; }
    setEditingPostId(post.id);
    setEditingText(post.content);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || !checkOwner(targetPost.author.id)) {
      setFeedError("You can only edit your own post.");
      return;
    }

    const trimmed = editingText.trim();
    if (!trimmed) return;

    const result = await updatePostRequest(postId, trimmed);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to update post.");
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, content: trimmed } : post,
      ),
    );
    setEditingPostId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingText("");
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || !checkOwner(targetPost.author.id)) {
      setFeedError("You can only delete your own post.");
      return;
    }

    const result = await deletePostRequest(postId);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to delete post.");
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setMyLikeIdsByPostId?.((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setTotalPosts?.((prev) => Math.max(0, prev - 1));
    if (editingPostId === postId) {
      setEditingPostId(null);
      setEditingText("");
    }
  };

  return {
    composerText,
    editingPostId,
    editingText,
    setEditingText,
    handleComposerChange,
    handleCreatePost,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDeletePost,
  };
}
