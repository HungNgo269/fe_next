import { useEffect, useState } from "react";
import {
  createCommentRequest,
  createLikeRequest,
  createPostRequest,
  deleteCommentRequest,
  deleteLikeRequest,
  deletePostRequest,
  fetchFeedBootstrap,
  updateCommentRequest,
  updatePostRequest,
} from "../api/feedApi";
import {
  initialPosts,
  stories as fallbackStories,
  suggestions as fallbackSuggestions,
} from "../data/feed";
import type {
  AvatarInfo,
  PostData,
  SidebarMessagePreview,
  SidebarNotificationItem,
  StoryData,
  Suggestion,
} from "../types/feed";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

export type CurrentUser = AvatarInfo;

export function useSocialFeed() {
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: "guest-user",
    name: "Guest",
    handle: "guest",
    initials: "GU",
    colorClass: "avatar-slate",
  });
  const [stories, setStories] = useState<StoryData[]>(() => fallbackStories);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    () => fallbackSuggestions,
  );
  const [sidebarMessages, setSidebarMessages] = useState<
    SidebarMessagePreview[]
  >([]);
  const [sidebarNotifications, setSidebarNotifications] = useState<
    SidebarNotificationItem[]
  >([]);
  const [myLikeIdsByPostId, setMyLikeIdsByPostId] = useState<
    Record<string, string>
  >({});
  const [posts, setPosts] = useState<PostData[]>(() => initialPosts);
  const [composerText, setComposerText] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const result = await fetchFeedBootstrap();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setFeedError(result.error.messages[0] ?? "Unable to load feed API.");
        setIsLoadingFeed(false);
        return;
      }

      setCurrentUser(result.data.currentUser);
      setIsAuthenticated(result.data.isAuthenticated);
      if (result.data.currentUserProfile) {
        setAuthenticatedProfile(result.data.currentUserProfile);
      } else {
        clearAuthenticatedProfile();
      }
      setPosts(result.data.posts);
      setStories(result.data.stories);
      setSuggestions(result.data.suggestions);
      setSidebarMessages(result.data.sidebarMessages);
      setSidebarNotifications(result.data.sidebarNotifications);
      setMyLikeIdsByPostId(result.data.userLikeByPostId);
      setFeedError("");
      setIsLoadingFeed(false);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [clearAuthenticatedProfile, setAuthenticatedProfile]);

  const requireAuth = () => {
    setShowLoginDialog(true);
  };

  const isOwnerById = (ownerId?: string) =>
    Boolean(ownerId) && ownerId === currentUser.id;

  const handleComposerChange = (nextValue: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    setComposerText(nextValue);
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    const trimmed = composerText.trim();
    if (!trimmed) {
      return;
    }

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
    setComposerText("");
  };

  const handleStartEdit = (post: PostData) => {
    if (!isAuthenticated || !isOwnerById(post.author.id)) {
      requireAuth();
      return;
    }
    setEditingPostId(post.id);
    setEditingText(post.content);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || !isOwnerById(targetPost.author.id)) {
      setFeedError("You can only edit your own post.");
      return;
    }

    const trimmed = editingText.trim();
    if (!trimmed) {
      return;
    }

    const result = await updatePostRequest(postId, trimmed);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to update post.");
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              content: trimmed,
            }
          : post,
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
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost || !isOwnerById(targetPost.author.id)) {
      setFeedError("You can only delete your own post.");
      return;
    }

    const result = await deletePostRequest(postId);
    if (!result.ok) {
      setFeedError(result.error.messages[0] ?? "Unable to delete post.");
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    if (editingPostId === postId) {
      setEditingPostId(null);
      setEditingText("");
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    const currentLikeId = myLikeIdsByPostId[postId];
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) {
      return;
    }

    if (targetPost.likedByMe && currentLikeId) {
      const unlikeResult = await deleteLikeRequest(currentLikeId);
      if (!unlikeResult.ok) {
        setFeedError(
          unlikeResult.error.messages[0] ?? "Unable to unlike post.",
        );
        return;
      }
      setMyLikeIdsByPostId((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } else if (!targetPost.likedByMe) {
      const likeResult = await createLikeRequest(postId, currentUser.id);
      if (!likeResult.ok) {
        setFeedError(likeResult.error.messages[0] ?? "Unable to like post.");
        return;
      }
      setMyLikeIdsByPostId((prev) => ({
        ...prev,
        [postId]: likeResult.data.id,
      }));
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextLiked = !post.likedByMe;
        return {
          ...post,
          likedByMe: nextLiked,
          likes: post.likes + (nextLiked ? 1 : -1),
        };
      }),
    );
  };

  const handleShare = (postId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              shares: post.shares + 1,
            }
          : post,
      ),
    );
  };

  const handleCommentDraft = (postId: string, value: string) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    const draft = (commentDrafts[postId] ?? "").trim();
    if (!draft) {
      return;
    }

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
                {
                  id: result.data.id,
                  author: currentUser,
                  text: draft,
                  time: "Just now",
                },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  const handleSaveCommentEdit = async (
    postId: string,
    commentId: string,
    content: string,
  ) => {
    if (!isAuthenticated) {
      requireAuth();
      return false;
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const targetComment = targetPost?.comments.find(
      (comment) => comment.id === commentId,
    );
    if (!targetComment || !isOwnerById(targetComment.author.id)) {
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
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text: trimmed, time: "Just now" }
                  : comment,
              ),
            }
          : post,
      ),
    );
    return true;
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!isAuthenticated) {
      requireAuth();
      return false;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const targetComment = targetPost?.comments.find(
      (comment) => comment.id === commentId,
    );
    if (!targetComment || !isOwnerById(targetComment.author.id)) {
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
          ? {
              ...post,
              comments: post.comments.filter((comment) => comment.id !== commentId),
            }
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
    isLoadingFeed,
    feedError,
    isAuthenticated,
    showLoginDialog,
    currentUser,
    stories,
    suggestions,
    sidebarMessages,
    sidebarNotifications,
    posts,
    composerText,
    editingPostId,
    editingText,
    commentDrafts,
    setShowLoginDialog,
    setEditingText,
    handleComposerChange,
    handleCreatePost,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDeletePost,
    handleToggleLike,
    handleShare,
    handleCommentDraft,
    handleAddComment,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportContent,
    requireAuth,
  };
}
