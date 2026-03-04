"use client";

import { useModalPostContentContext } from "./ModalPostContentContext";

export default function ModalPostComposer() {
  const { commentDraft, setCommentDraft, handleAddComment } =
    useModalPostContentContext();
  const isDisabled = commentDraft.trim().length === 0;

  return (
    <div className="flex items-center gap-3 border-t border-border px-4 py-3">
      <input
        className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
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
        className="text-xs font-semibold text-brand transition-opacity hover:opacity-70 disabled:opacity-40"
        disabled={isDisabled}
        onClick={handleAddComment}
        type="button"
      >
        Post
      </button>
    </div>
  );
}



