"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { PostComment } from "../types/api.types";
import { useCommentActions } from "../hooks/useCommentActions";
import { useOwnership } from "../hooks/useOwnership";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";

export default function ModalCommentItem({
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
  const { isCommentOwner } = useOwnership();
  const canManage = isCommentOwner(postId, comment.id);
  const authorProfileKey = comment.author.handle || comment.author.id;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
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
    if (ok) setIsMenuOpen(false);
  };

  const startReply = () => {
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

  return (
    <div>
      <div className="group flex items-start gap-3 px-4 py-2">
        <Avatar
          avatar={comment.author.avatarUrl ?? undefined}
          gender={comment.author.gender}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <Link
              className="text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
              href={`/profile/${authorProfileKey}`}
            >
              {comment.author.name}
            </Link>
            <span className="ui-text-muted text-2xs">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <div className="mt-1 space-y-2">
              <input
                className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
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
            <p className="ui-text-muted text-xs">{comment.content}</p>
          )}

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

        <div className="relative ml-auto self-start" ref={menuRef}>
          <button
            className="ui-text-muted rounded-full p-1.5 opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100 focus:opacity-100"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            type="button"
          >
            <IconMoreVertical />
          </button>
          {isMenuOpen ? (
            <div className="absolute right-0 top-8 z-20 min-w-36 rounded-xl border border-border bg-surface p-2">
              {!isReplyItem ? (
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={startReply}
                  type="button"
                >
                  Reply comment
                </button>
              ) : null}
              {canManage ? (
                <>
                  <button
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                    onClick={startEdit}
                    type="button"
                  >
                    Edit comment
                  </button>
                  <button
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                    onClick={() => void handleDelete()}
                    type="button"
                  >
                    Delete comment
                  </button>
                </>
              ) : (
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
              )}
            </div>
          ) : null}
        </div>
      </div>

      {!isReplyItem && comment.replies && comment.replies.length > 0 ? (
        <div className="space-y-1 pl-10">
          {comment.replies.map((reply) => (
            <ModalCommentItem key={reply.id} postId={postId} comment={reply} isReplyItem />
          ))}
        </div>
      ) : null}
    </div>
  );
}
