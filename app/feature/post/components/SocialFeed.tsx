"use client";

import { useState } from "react";
import {
  currentUser,
  initialPosts,
  navItems,
  stories,
  suggestions,
  trendingTopics,
} from "../data/feed";
import type { PostData } from "../types/feed";
import FeedComposer from "./FeedComposer";
import FeedHeader from "./FeedHeader";
import FeedStories from "./FeedStories";
import LeftSidebar from "./LeftSidebar";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";

export default function SocialFeed() {
  const [posts, setPosts] = useState<PostData[]>(() => initialPosts);
  const [composerText, setComposerText] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );

  const handleCreatePost = () => {
    const trimmed = composerText.trim();
    if (!trimmed) {
      return;
    }

    const newPost: PostData = {
      id: `post-${Date.now()}`,
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
    setEditingPostId(post.id);
    setEditingText(post.content);
  };

  const handleSaveEdit = (postId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              content: trimmed,
            }
          : post
      )
    );
    setEditingPostId(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingText("");
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    if (editingPostId === postId) {
      setEditingPostId(null);
      setEditingText("");
    }
  };

  const handleToggleLike = (postId: string) => {
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
      })
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
          : post
      )
    );
  };

  const handleCommentDraft = (postId: string, value: string) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDrafts[postId] ?? "").trim();
    if (!draft) {
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
                  id: `comment-${Date.now()}`,
                  author: currentUser,
                  text: draft,
                  time: "Just now",
                },
              ],
            }
          : post
      )
    );
    setCommentDrafts((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-radial-feed text-slate-900">
      <div className="pointer-events-none absolute -top-32 -right-10p h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -bottom-15p -left-10p h-96 w-96 rounded-full bg-blue-200/40 blur-3xl float-slow" />

      <FeedHeader currentUser={currentUser} />

      <main className="relative mx-auto grid w-full max-w-6xl grid-cols-12 gap-6 px-4 pb-16 pt-10 sm:px-6">
        <LeftSidebar currentUser={currentUser} navItems={navItems} />

        <section className="col-span-12 space-y-6 lg:col-span-6">
          <FeedComposer
            currentUser={currentUser}
            value={composerText}
            onChange={setComposerText}
            onSubmit={handleCreatePost}
          />

          <FeedStories stories={stories} />

          <div className="space-y-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                index={index}
                post={post}
                isEditing={editingPostId === post.id}
                editingText={editingPostId === post.id ? editingText : post.content}
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

        <RightSidebar
          trendingTopics={trendingTopics}
          suggestions={suggestions}
        />
      </main>
    </div>
  );
}
