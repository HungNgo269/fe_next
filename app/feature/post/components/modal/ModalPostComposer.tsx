"use client";

import { useModalPostActionsContext } from "./ModalPostContentContext";

export default function ModalPostComposer() {
  const { commentDraft, setCommentDraft, handleAddComment } =
    useModalPostActionsContext();
  const isDisabled = commentDraft.trim().length === 0;

  return (
    <div className="post-detail-composer flex items-center gap-3 px-4 py-3">
      <input
        className="ui-input flex-1 rounded-full border border-border/70 px-4 py-2 text-sm outline-none transition-colors"
        id="modal-post-comment-input"
        placeholder="Add a comment..."
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
        className="text-sm font-semibold text-brand transition-opacity hover:opacity-70 disabled:opacity-40"
        disabled={isDisabled}
        onClick={handleAddComment}
        type="button"
      >
        Post
      </button>
    </div>
  );
}
