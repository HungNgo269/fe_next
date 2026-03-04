"use client";

import { CirclePlus } from "lucide-react";
import ModalCommentItem from "../ModalCommentItem";
import { useModalPostContentContext } from "./ModalPostContentContext";

export default function ModalPostComments() {
  const {
    postId,
    commentsLoading,
    visibleRootComments,
    hasMoreRootComments,
    showMoreRootComments,
  } = useModalPostContentContext();

  return (
    <div className="post-detail-comments">
      {commentsLoading ? (
        <div className="flex items-center justify-center py-8">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      ) : visibleRootComments.length === 0 ? (
        <p className="ui-text-muted py-8 text-center text-xs">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-1">
          {visibleRootComments.map((comment) => (
            <ModalCommentItem key={comment.id} postId={postId} comment={comment} />
          ))}
          {hasMoreRootComments ? (
            <button
              className="flex w-full flex-row items-center justify-center gap-1.5 px-4 pt-2 text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
              onClick={showMoreRootComments}
              type="button"
            >
              <CirclePlus />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}



