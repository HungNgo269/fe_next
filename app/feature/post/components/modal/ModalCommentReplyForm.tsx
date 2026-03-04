"use client";

import { useModalCommentItemContext } from "./ModalCommentItemContext";

export default function ModalCommentReplyForm() {
  const {
    comment,
    replyText,
    setReplyText,
    submitReply,
    cancelReply,
  } = useModalCommentItemContext();

  return (
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
            submitReply();
          }
        }}
      />
      <div className="flex items-center gap-3">
        <button
          className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
          disabled={replyText.trim().length === 0}
          onClick={submitReply}
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
  );
}



