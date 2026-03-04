"use client";

import Link from "next/link";
import { memo, useCallback, useState } from "react";
import type { PostComment } from "../types/api.types";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";
import { useCommentActions } from "../hooks/useCommentActions";
import { useOwnership } from "../hooks/useOwnership";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";
import { fetchRepliesByCommentId } from "../api/postCommentApi";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import { Loader2 } from "lucide-react";

function CommentItemComponent({
  postId,
  comment,
  isReplyItem = false,
}: {
  postId: string;
  comment: PostComment;
  isReplyItem?: boolean;
}) {
  const {
    handleAddReply,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportContent,
  } = useCommentActions(postId);
  const { isCommentOwner, isPostOwner } = useOwnership();
  const cacheUpdater = useFeedCacheUpdater();
  const canEditComment = isCommentOwner(postId, comment.id);
  const canDeleteComment = isPostOwner(postId);
  const authorProfileKey = comment.author.handle || comment.author.id;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const menuRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setIsMenuOpen(false), []),
  );

  const startEdit = () => {
    setEditingText(comment.content);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingText("");
  };

  const saveEdit = async () => {
    const ok = await handleSaveCommentEdit(comment.id, editingText);
    if (ok) cancelEdit();
  };

  const handleDelete = async () => {
    const ok = await handleDeleteComment(comment.id);
    if (ok) {
      setIsMenuOpen(false);
      if (isEditing) cancelEdit();
    }
  };

  const startReply = () => {
    if (isReplyItem) return;
    setIsReplying(true);
    setIsMenuOpen(false);
  };

  const cancelReply = () => {
    setIsReplying(false);
    setReplyText("");
  };

  const submitReply = async () => {
    const ok = await handleAddReply(comment.id, replyText);
    if (ok) cancelReply();
  };

  const numLoadedReplies = comment.replies?.length ?? 0;
  const totalReplies = comment._count?.replies ?? 0;
  const hasMoreReplies = numLoadedReplies < totalReplies;

  const handleLoadMoreReplies = async () => {
    if (isLoadingReplies || !hasMoreReplies) return;
    setIsLoadingReplies(true);
    try {
      const take = 10;
      const result = await fetchRepliesByCommentId(
        comment.id,
        numLoadedReplies,
        take,
      );
      if (result.ok && result.data.length > 0) {
        cacheUpdater.appendReplies(postId, comment.id, result.data);
      }
    } catch (e) {
      console.error("Failed to load replies", e);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  return (
    <div>
      <div className="ui-subtle group relative flex items-start gap-3 rounded-2xl px-3 py-2.5">
        <Avatar
          initials={undefined}
          avatar={comment.author.avatarUrl ?? undefined}
          gender={comment.author.gender}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              className="text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
              href={`/profile/${authorProfileKey}`}
            >
              {comment.author.name}
            </Link>
            {!isReplyItem ? (
              <span className="ui-text-muted text-2xs font-normal">
                {formatRelativeTime(comment.createdAt)}
              </span>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-2">
              <input
                className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
                value={editingText}
                onChange={(event) => setEditingText(event.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
                  onClick={() => void saveEdit()}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                  onClick={cancelEdit}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="ui-text-muted mt-0.5 text-xs">{comment.content}</p>
          )}
          {!isEditing && !isReplyItem ? (
            <div className="mt-1">
              <button
                className="ui-text-muted text-2xs font-semibold uppercase tracking-wide transition-opacity hover:opacity-70"
                onClick={startReply}
                type="button"
              >
                Replies
              </button>
            </div>
          ) : null}

          {isReplying && !isReplyItem ? (
            <div className="mt-2 space-y-2">
              <input
                className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
                placeholder={`Reply to ${comment.author.name}...`}
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    replyText.trim().length > 0
                  ) {
                    event.preventDefault();
                    void submitReply();
                  }
                }}
              />
              <div className="flex items-center gap-3">
                <button
                  className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
                  disabled={replyText.trim().length === 0}
                  onClick={() => void submitReply()}
                  type="button"
                >
                  Reply
                </button>
                <button
                  className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                  onClick={cancelReply}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative ml-2 self-start" ref={menuRef}>
          <button
            className="ui-text-muted rounded-full p-1.5 opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100 focus:opacity-100"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            type="button"
          >
            <IconMoreVertical />
          </button>
          {isMenuOpen ? (
            <div className=" absolute right-0 top-8 z-20 min-w-36 rounded-xl p-2">
              {canEditComment ? (
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={startEdit}
                  type="button"
                >
                  Edit comment
                </button>
              ) : null}
              {canDeleteComment ? (
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => void handleDelete()}
                  type="button"
                >
                  Delete comment
                </button>
              ) : null}
              {!canEditComment && !canDeleteComment ? (
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleReportContent("comment");
                  }}
                  type="button"
                >
                  Report comment
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {!isReplyItem && (numLoadedReplies > 0 || hasMoreReplies) ? (
        <div className="mt-2 space-y-2 pl-8">
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              isReplyItem
            />
          ))}
          {hasMoreReplies ? (
            <div className="pt-2 flex items-center">
              <span className="w-6 border-t border-border mr-2 inline-block"></span>
              <button
                type="button"
                className="inline-flex items-center justify-center text-xs font-semibold text-foreground hover:underline disabled:no-underline"
                onClick={() => void handleLoadMoreReplies()}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies
                  ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="h-3.5 w-3.5 animate-spin"
                      />
                      <span className="sr-only">Loading replies</span>
                    </>
                  )
                  : `Show more ${totalReplies - numLoadedReplies} comment${totalReplies - numLoadedReplies > 1 ? "s" : ""}`}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const CommentItem = memo(CommentItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.postId === nextProps.postId &&
    prevProps.isReplyItem === nextProps.isReplyItem &&
    prevProps.comment.id === nextProps.comment.id &&
    prevProps.comment.content === nextProps.comment.content &&
    prevProps.comment.createdAt === nextProps.comment.createdAt &&
    prevProps.comment._count?.replies === nextProps.comment._count?.replies &&
    prevProps.comment.replies?.length === nextProps.comment.replies?.length
  );
});

export default CommentItem;
