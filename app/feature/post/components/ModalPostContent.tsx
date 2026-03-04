"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Post, PostComment } from "../types/api.types";
import { fetchCommentsByPostId } from "../api/postCommentApi";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";
import { useCommentActions } from "../hooks/useCommentActions";
import { useLikeActions } from "../hooks/useLikeActions";
import { usePostActions } from "../hooks/usePostActions";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import ActionButton from "./ui/ActionButton";
import { IconLike, IconShare } from "@/app/share/components/icons";
import { useSharePost } from "../hooks/useSharePost";
import ModalCommentItem from "./ModalCommentItem";
import { commentQueryKey } from "./PostDetailModal";

export default function ModalPostContent({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const postId = post.sourcePostId ?? post.id;

  const { data: comments = [], isLoading: commentsLoading } = useQuery<
    PostComment[]
  >({
    queryKey: commentQueryKey(postId),
    queryFn: async () => {
      const result = await fetchCommentsByPostId(postId, true);
      return result.ok ? result.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });
  const totalComments = comments.reduce(
    (acc, root) => acc + 1 + (root.replies?.length ?? 0),
    0,
  );

  const stableClose = useCallback(() => onClose(), [onClose]);
  const contentRef = useClickOutside<HTMLDivElement>(stableClose);

  // ESC → close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const { handleToggleLike } = useLikeActions(postId);
  const { handleCopyShareLink } = useSharePost(postId);
  const {
    isEditing,
    editingText,
    setEditingText,
    handleSaveEdit,
    handleCancelEdit,
    isOwner,
    handleStartEdit,
    handleDeletePost,
  } = usePostActions(postId);

  const { commentDraft, setCommentDraft, handleAddComment } =
    useCommentActions(postId);

  const author = post.author;
  const fallback = author.email.split("@")[0] ?? "user";
  const userHandle = author.handle || fallback;
  const profileKey = author.handle || author.id;
  const commentEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="post-detail-overlay">
      <div className="post-detail-container" ref={contentRef}>
        <div className="post-detail-left">
          {post.mediaUrls && post.mediaUrls.length > 0 ? (
            <img
              className="post-detail-media"
              src={post.mediaUrls[0]}
              alt="Post media"
            />
          ) : (
            <div className="post-detail-text-content">
              <p className="text-lg leading-7 text-foreground">
                {post.content}
              </p>
            </div>
          )}
        </div>

        <div className="post-detail-right">
          <div className="post-detail-header">
            <div className="flex items-center gap-3">
              <Avatar
                avatar={
                  post.sharedBy?.avatarUrl ?? author.avatarUrl ?? undefined
                }
                gender={author.gender}
              />
              <div>
                {post.sharedBy ? (
                  <p className="ui-text-muted text-[11px] font-medium">
                    <span className="text-foreground">
                      {post.sharedBy.name}
                    </span>{" "}
                    shared this post
                  </p>
                ) : null}
                <Link
                  className="text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
                  href={`/profile/${profileKey}`}
                  onClick={onClose}
                >
                  {author.name}
                  <span className="ui-text-muted ml-2 text-xs font-medium">
                    @{userHandle}
                  </span>
                </Link>
                <p className="ui-text-muted text-xs">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex items-center gap-1">
                <button
                  className="ui-text-muted rounded-full p-1.5 text-xs transition-opacity hover:opacity-70"
                  onClick={handleStartEdit}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-full p-1.5 text-xs text-destructive transition-opacity hover:opacity-70"
                  onClick={() => {
                    handleDeletePost();
                    onClose();
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>

          <div className="post-detail-body">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
                    onClick={handleSaveEdit}
                    type="button"
                  >
                    Save changes
                  </button>
                  <button
                    className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="ui-text-muted text-sm leading-6">{post.content}</p>
            )}
          </div>

          <div className="post-detail-comments">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
              </div>
            ) : comments.length === 0 ? (
              <p className="ui-text-muted py-8 text-center text-xs">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <ModalCommentItem
                    key={comment.id}
                    postId={postId}
                    comment={comment}
                  />
                ))}
                <div ref={commentEndRef} />
              </div>
            )}
          </div>

          <div className="post-detail-actions">
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="ui-text-muted text-xs">
                  {post.likesCount} likes
                </span>
                <span className="ui-text-muted text-xs">·</span>
                <span className="ui-text-muted text-xs">
                  {totalComments} comments
                </span>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border px-4 py-2">
              <ActionButton
                active={post.likedByMe}
                icon={<IconLike />}
                label="Like"
                onClick={handleToggleLike}
              />
              <ActionButton
                icon={<IconShare />}
                label="Share"
                onClick={() => void handleCopyShareLink()}
              />
            </div>

            <div className="flex items-center gap-3 border-t border-border px-4 py-3">
              <input
                className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
                placeholder="Add a comment..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    commentDraft.trim().length > 0
                  ) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <button
                className="text-xs font-semibold text-brand transition-opacity hover:opacity-70 disabled:opacity-40"
                disabled={commentDraft.trim().length === 0}
                onClick={handleAddComment}
                type="button"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
