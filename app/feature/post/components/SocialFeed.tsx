"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createCommentRequest,
  createLikeRequest,
  createPostRequest,
  deleteLikeRequest,
  deletePostRequest,
  fetchFeedBootstrap,
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
import FeedComposer from "./FeedComposer";
import FeedStories from "./FeedStories";
import LeftSidebar from "./LeftSidebar";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";

type CurrentUser = AvatarInfo & { id: string };

export default function SocialFeed() {
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
  }, []);

  const requireAuth = () => {
    setShowLoginDialog(true);
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
    if (!isAuthenticated || post.author.handle !== currentUser.handle) {
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative grid w-full grid-cols-12 gap-6 px-4 pb-16 pt-10 sm:px-6 lg:pl-24">
        <LeftSidebar
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onRequireAuth={requireAuth}
          messages={sidebarMessages}
          notifications={sidebarNotifications}
        />

        <section className="col-span-12 space-y-6 lg:col-span-6">
          {isLoadingFeed ? (
            <div className="ui-card ui-text-muted rounded-2xl px-4 py-3 text-sm">
              Syncing feed from backend...
            </div>
          ) : null}
          {feedError ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
              {feedError}
            </div>
          ) : null}

          <FeedStories stories={stories} />

          <FeedComposer
            currentUser={currentUser}
            value={composerText}
            onChange={(nextValue) => {
              if (!isAuthenticated) {
                requireAuth();
                return;
              }
              setComposerText(nextValue);
            }}
            onSubmit={handleCreatePost}
          />

          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                index={index}
                post={post}
                isEditing={editingPostId === post.id}
                editingText={
                  editingPostId === post.id ? editingText : post.content
                }
                commentDraft={commentDrafts[post.id] ?? ""}
                onStartEdit={() => handleStartEdit(post)}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={() => handleSaveEdit(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onChangeEditingText={setEditingText}
                onToggleLike={() => handleToggleLike(post.id)}
                onShare={() => handleShare(post.id)}
                onChangeCommentDraft={(value) =>
                  handleCommentDraft(post.id, value)
                }
                onAddComment={() => handleAddComment(post.id)}
              />
            ))}
          </div>
        </section>

        <RightSidebar suggestions={suggestions} />
      </main>

      {showLoginDialog ? (
        <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="ui-card w-full max-w-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground">Sign in required</h2>
            <p className="ui-text-muted mt-2 text-sm">
              You can browse posts and profiles as a guest, but posting, liking,
              commenting, and editing require an account.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/login"
                className="ui-btn-primary rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              >
                Go to login
              </Link>
              <button
                type="button"
                onClick={() => setShowLoginDialog(false)}
                className="ui-btn-ghost rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
