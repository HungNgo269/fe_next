"use client";

import {
  useModalCommentDataContext,
  useModalCommentActionsContext,
} from "./ModalCommentItemContext";

export default function ModalCommentMenu() {
  const { canEditComment, canDeleteComment } = useModalCommentDataContext();
  const { startEdit, deleteComment, reportComment } = useModalCommentActionsContext();

  return (
    <div className="absolute right-0 top-8 z-20 min-w-36 rounded-xl border border-border bg-surface p-2">
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
          onClick={deleteComment}
          type="button"
        >
          Delete comment
        </button>
      ) : null}
      {!canEditComment && !canDeleteComment ? (
        <button
          className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
          onClick={reportComment}
          type="button"
        >
          Report comment
        </button>
      ) : null}
    </div>
  );
}



