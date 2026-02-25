import { useFeedBootstrap } from "./useFeedBootstrap";
import { useFeedPostActions } from "./useFeedPostActions";
import { useFeedLikes } from "./useFeedLikes";
import { useFeedComments } from "./useFeedComments";

export type { CurrentUser } from "./useFeedBootstrap";

export function useSocialFeed() {
  const bootstrap = useFeedBootstrap();

  const postActions = useFeedPostActions({
    isAuthenticated: bootstrap.isAuthenticated,
    currentUser: bootstrap.currentUser,
    posts: bootstrap.posts,
    setPosts: bootstrap.setPosts,
    setFeedError: bootstrap.setFeedError,
    requireAuth: bootstrap.requireAuth,
    isOwnerById: bootstrap.isOwnerById,
  });

  const likes = useFeedLikes({
    isAuthenticated: bootstrap.isAuthenticated,
    currentUserId: bootstrap.currentUser.id,
    posts: bootstrap.posts,
    setPosts: bootstrap.setPosts,
    myLikeIdsByPostId: bootstrap.myLikeIdsByPostId,
    setMyLikeIdsByPostId: bootstrap.setMyLikeIdsByPostId,
    setFeedError: bootstrap.setFeedError,
    requireAuth: bootstrap.requireAuth,
  });

  const comments = useFeedComments({
    isAuthenticated: bootstrap.isAuthenticated,
    currentUser: bootstrap.currentUser,
    posts: bootstrap.posts,
    setPosts: bootstrap.setPosts,
    setFeedError: bootstrap.setFeedError,
    requireAuth: bootstrap.requireAuth,
    isOwnerById: bootstrap.isOwnerById,
  });

  return {
    isLoadingFeed: bootstrap.isLoadingFeed,
    feedError: bootstrap.feedError,
    isAuthenticated: bootstrap.isAuthenticated,
    showLoginDialog: bootstrap.showLoginDialog,
    currentUser: bootstrap.currentUser,
    stories: bootstrap.stories,
    suggestions: bootstrap.suggestions,
    sidebarMessages: bootstrap.sidebarMessages,
    sidebarNotifications: bootstrap.sidebarNotifications,
    posts: bootstrap.posts,
    composerText: postActions.composerText,
    editingPostId: postActions.editingPostId,
    editingText: postActions.editingText,
    commentDrafts: comments.commentDrafts,
    setShowLoginDialog: bootstrap.setShowLoginDialog,
    setEditingText: postActions.setEditingText,
    handleComposerChange: postActions.handleComposerChange,
    handleCreatePost: postActions.handleCreatePost,
    handleStartEdit: postActions.handleStartEdit,
    handleSaveEdit: postActions.handleSaveEdit,
    handleCancelEdit: postActions.handleCancelEdit,
    handleDeletePost: postActions.handleDeletePost,
    handleToggleLike: likes.handleToggleLike,
    handleShare: likes.handleShare,
    handleCommentDraft: comments.handleCommentDraft,
    handleAddComment: comments.handleAddComment,
    handleSaveCommentEdit: comments.handleSaveCommentEdit,
    handleDeleteComment: comments.handleDeleteComment,
    handleReportContent: comments.handleReportContent,
    requireAuth: bootstrap.requireAuth,
  };
}
