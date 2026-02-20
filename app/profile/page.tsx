"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchFeedBootstrap } from "../feature/post/api/feedApi";
import PostCard from "../feature/post/components/PostCard";
import type { PostData } from "../feature/post/types/feed";
import { getCurrentUserProfile } from "../feature/profile/api/profileApi";
import ProfileAvatarPreview from "../feature/profile/components/ProfileAvatarPreview";
import ProfileShell from "../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../feature/profile/components/ProfileStatusCard";
import type { UserProfile } from "../feature/profile/types/profile";

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
};

const buildInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return "U";
  }
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [myPosts, setMyPosts] = useState<PostData[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [postsError, setPostsError] = useState("");
  const commentSeqRef = useRef(0);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const profileResult = await getCurrentUserProfile();
      if (!active) {
        return;
      }

      if (!profileResult.ok) {
        setIsUnauthorized(
          profileResult.error.status === 401 || profileResult.error.status === 403,
        );
        setProfileError(profileResult.error.messages[0] ?? "Unable to load profile.");
        setIsProfileLoading(false);
        return;
      }

      setProfile(profileResult.data);
      setIsUnauthorized(false);
      setProfileError("");
      setIsProfileLoading(false);
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isProfileLoading || isUnauthorized) {
      return;
    }

    let active = true;

    const loadPosts = async () => {
      setIsPostsLoading(true);
      setPostsError("");

      const feedResult = await fetchFeedBootstrap();
      if (!active) {
        return;
      }

      if (!feedResult.ok) {
        setPostsError(feedResult.error.messages[0] ?? "Unable to load your posts.");
        setMyPosts([]);
        setIsPostsLoading(false);
        return;
      }

      const ownedPosts = feedResult.data.posts.filter(
        (post) => post.author.id === feedResult.data.currentUser.id,
      );
      setCurrentUserId(feedResult.data.currentUser.id);
      setMyPosts(ownedPosts);
      setIsPostsLoading(false);
    };

    void loadPosts();

    return () => {
      active = false;
    };
  }, [isProfileLoading, isUnauthorized]);

  const initials = useMemo(() => buildInitials(profile.name), [profile.name]);

  const handleStartEdit = (post: PostData) => {
    setEditingPostId(post.id);
    setEditingText(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (postId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      return;
    }
    setMyPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, content: trimmed } : post)),
    );
    setEditingPostId(null);
    setEditingText("");
  };

  const handleDeletePost = async (postId: string) => {
    setMyPosts((prev) => prev.filter((post) => post.id !== postId));
    if (editingPostId === postId) {
      setEditingPostId(null);
      setEditingText("");
    }
  };

  const handleToggleLike = async (postId: string) => {
    setMyPosts((prev) =>
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
    setMyPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, shares: post.shares + 1 } : post)),
    );
  };

  const handleCommentDraft = (postId: string, value: string) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId: string) => {
    const draft = (commentDrafts[postId] ?? "").trim();
    if (!draft) {
      return;
    }

    commentSeqRef.current += 1;
    const newCommentId = `local-comment-${commentSeqRef.current}`;
    setMyPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: newCommentId,
                  author: {
                    id: currentUserId,
                    name: profile.name || "You",
                    handle: "you",
                    initials: initials || "U",
                    colorClass: "avatar-blue",
                  },
                  text: draft,
                  time: "Just now",
                },
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
  ) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }

    setMyPosts((prev) =>
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
    setMyPosts((prev) =>
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

  const handleReportContent = () => {
    setPostsError("Report submitted (demo).");
  };

  return (
    <ProfileShell>
      {isProfileLoading ? (
        <main className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 pb-16 pt-12 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
            <span className="ui-text-muted text-sm">Loading profile...</span>
          </div>
        </main>
      ) : isUnauthorized ? (
        <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="ui-btn-ghost rounded-full px-5 py-2 text-xs font-semibold transition"
                  href="/"
                >
                  Back to feed
                </Link>
              </div>
            }
            message="You can browse the app without logging in, but your personal profile is only available after sign-in."
            title="Profile is locked"
            variant="error"
          />
        </main>
      ) : (
        <main className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
          <section className="ui-card rounded-lg p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <ProfileAvatarPreview
                  avatarUrl={profile.avatar}
                  fallbackInitials={initials}
                  name={profile.name}
                />
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {profile.name || "Unnamed user"}
                  </p>
                  <p className="ui-text-muted text-sm">{profile.email || "No email"}</p>
                  <p className="ui-text-muted text-xs uppercase tracking-wider">
                    {profile.gender || "Unknown"}
                  </p>
                </div>
              </div>
              <Link
                className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                href="/profile/edit"
              >
                Edit your profile
              </Link>
            </div>
            {profileError ? (
              <p className="ui-alert-warning mt-4 rounded-2xl px-4 py-3 text-sm">
                {profileError}
              </p>
            ) : null}
          </section>

          <section className="space-y-3">
            <header className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-foreground">Your posts</h2>
              <Link
                className="ui-btn-ghost rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                href="/"
              >
                Back to feed
              </Link>
            </header>

            {isPostsLoading ? (
              <div className="ui-card flex items-center justify-center gap-3 rounded-lg p-6">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
                <span className="ui-text-muted text-sm">Loading posts...</span>
              </div>
            ) : postsError ? (
              <div className="ui-alert-warning rounded-2xl px-4 py-3 text-sm">
                {postsError}
              </div>
            ) : myPosts.length === 0 ? (
              <p className="ui-text-muted text-sm">You have not created any posts yet.</p>
            ) : (
              <div className="space-y-6">
                {myPosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={index}
                    isEditing={editingPostId === post.id}
                    editingText={editingPostId === post.id ? editingText : post.content}
                    commentDraft={commentDrafts[post.id] ?? ""}
                    currentUserId={currentUserId}
                    onStartEdit={() => handleStartEdit(post)}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={() => handleSaveEdit(post.id)}
                    onDelete={() => handleDeletePost(post.id)}
                    onChangeEditingText={setEditingText}
                    onToggleLike={() => handleToggleLike(post.id)}
                    onShare={() => handleShare(post.id)}
                    onChangeCommentDraft={(value) => handleCommentDraft(post.id, value)}
                    onAddComment={() => handleAddComment(post.id)}
                    onSaveCommentEdit={(commentId, content) =>
                      handleSaveCommentEdit(post.id, commentId, content)
                    }
                    onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                    onReportPost={handleReportContent}
                    onReportComment={handleReportContent}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </ProfileShell>
  );
}
