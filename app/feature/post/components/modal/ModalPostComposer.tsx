"use client";

import { useAutoResizeTextarea } from "@/app/share/hooks/useAutoResizeTextarea";
import { useModalPostActionsContext } from "./ModalPostContentContext";

export default function ModalPostComposer() {
  const { commentDraft, setCommentDraft, handleAddComment } =
    useModalPostActionsContext();
  const isDisabled = commentDraft.trim().length === 0;
  const commentTextareaRef = useAutoResizeTextarea<HTMLTextAreaElement>(
    commentDraft,
    { minHeight: 40, maxHeight: 180 },
  );

  return (
    <div className="post-detail-composer flex items-end gap-3 px-4 py-3">
      <textarea
        className="ui-input flex-1 resize-none rounded-2xl border border-border/70 px-4 py-2 text-sm outline-none transition-colors"
        id="modal-post-comment-input"
        placeholder="Add a comment..."
        ref={commentTextareaRef}
        rows={1}
        value={commentDraft}
        onChange={(event) => setCommentDraft(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            commentDraft.trim().length > 0
          ) {
            event.preventDefault();
            handleAddComment();
          }
        }}
      />
      <button
        className="self-end pb-1 text-sm font-semibold text-brand transition-opacity hover:opacity-70 disabled:opacity-40"
        disabled={isDisabled}
        onClick={handleAddComment}
        type="button"
      >
        Post
      </button>
    </div>
  );
}
