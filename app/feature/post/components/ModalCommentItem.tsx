"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { PostComment } from "../types/api.types";
import { useCommentActions } from "../hooks/useCommentActions";
import { useOwnership } from "../hooks/useOwnership";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";
import { fetchRepliesByCommentId } from "../api/postCommentApi";
import { useFeedCacheUpdater } from "@/app/share/hooks/useFeedCacheUpdater";
import ModalCommentMenu from "./modal/ModalCommentMenu";
import ModalCommentEditForm from "./modal/ModalCommentEditForm";
import ModalCommentReplyForm from "./modal/ModalCommentReplyForm";
import { ModalCommentItemProvider } from "./modal/ModalCommentItemContext";
import ReportReasonModal from "./ui/ReportReasonModal";

function ModalCommentItemComponent({
  postId,
  comment,
  isReplyItem = false,
}: {
  postId: string;
  comment: PostComment;
  isReplyItem?: boolean;
}) {
  const {
    isReportingComment,
    handleAddReply,
    handleSaveCommentEdit,
    handleDeleteComment,
    handleReportComment,
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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
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
    if (ok) {
      cancelEdit();
    }
  };

  const handleDelete = async () => {
    const ok = await handleDeleteComment(comment.id);
    if (ok) {
      setIsMenuOpen(false);
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
    if (ok) {
      cancelReply();
    }
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
    } catch (error) {
      console.error("Failed to load replies", error);
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const submitReport = async () => {
    const trimmed = reportText.trim();
    const ok = await handleReportComment(
      comment.id,
      trimmed ? trimmed : undefined,
    );
    if (!ok) return;
    setIsReportOpen(false);
    setReportText("");
  };

  return (
    <ModalCommentItemProvider
      value={{
        comment,
        canEditComment,
        canDeleteComment,
        editingText,
        setEditingText,
        saveEdit: () => void saveEdit(),
        cancelEdit,
        replyText,
        setReplyText,
        submitReply: () => void submitReply(),
        cancelReply,
        startEdit,
        deleteComment: () => void handleDelete(),
        reportComment: () => {
          setIsMenuOpen(false);
          setIsReportOpen(true);
        },
      }}
    >
      <div>
        <div className="group flex items-start gap-2.5 px-4 py-1.5">
          <Avatar
            avatar={comment.author.avatarUrl ?? undefined}
            gender={comment.author.gender}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                className="text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
                href={`/profile/${authorProfileKey}`}
              >
                {comment.author.name}
              </Link>
              {!isReplyItem ? (
                <span className="ui-text-muted text-2xs">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              ) : null}
            </div>

            {isEditing ? (
              <ModalCommentEditForm />
            ) : (
              <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-5 text-foreground/90">
                {comment.content}
              </p>
            )}

            {!isEditing && !isReplyItem ? (
              <div className="mt-0.5 flex items-center gap-3">
                <button
                  className="ui-text-muted text-2xs font-semibold transition-opacity hover:opacity-70"
                  onClick={startReply}
                  type="button"
                >
                  Reply
                </button>
              </div>
            ) : null}

            {isReplying && !isReplyItem ? <ModalCommentReplyForm /> : null}
          </div>

          <div className="relative ml-auto self-start" ref={menuRef}>
            <button
              className="ui-text-muted rounded-full p-1.5 opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100 focus:opacity-100"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              type="button"
            >
              <IconMoreVertical />
            </button>

            {isMenuOpen ? <ModalCommentMenu /> : null}
          </div>
        </div>

        {!isReplyItem && (numLoadedReplies > 0 || hasMoreReplies) ? (
          <div className="space-y-1 pb-1 pl-9 pr-2">
            {comment.replies?.map((reply) => (
              <ModalCommentItem
                key={reply.id}
                postId={postId}
                comment={reply}
                isReplyItem
              />
            ))}
            {hasMoreReplies ? (
              <div className="flex items-center pt-1">
                <span className="mr-2 inline-block w-6 "></span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center text-xs font-semibold text-foreground/80 hover:underline disabled:no-underline"
                  onClick={() => void handleLoadMoreReplies()}
                  disabled={isLoadingReplies}
                >
                  {isLoadingReplies ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    </>
                  ) : (
                    `Show more ${totalReplies - numLoadedReplies} replies`
                  )}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <ReportReasonModal
          isSubmitting={isReportingComment}
          onChange={setReportText}
          onClose={() => {
            if (isReportingComment) return;
            setIsReportOpen(false);
            setReportText("");
          }}
          onSubmit={() => void submitReport()}
          open={isReportOpen}
          title="Report comment"
          value={reportText}
        />
      </div>
    </ModalCommentItemProvider>
  );
}

const ModalCommentItem = memo(
  ModalCommentItemComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.postId === nextProps.postId &&
      prevProps.isReplyItem === nextProps.isReplyItem &&
      prevProps.comment.id === nextProps.comment.id &&
      prevProps.comment.content === nextProps.comment.content &&
      prevProps.comment.createdAt === nextProps.comment.createdAt &&
      prevProps.comment._count?.replies === nextProps.comment._count?.replies &&
      prevProps.comment.replies?.length === nextProps.comment.replies?.length
    );
  },
);

export default ModalCommentItem;
