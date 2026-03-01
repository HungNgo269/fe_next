"use client";

import type { PostComment } from "../types/api.types";
import CommentItem from "./CommentItem";
import { useCommentActions } from "../hooks/useCommentActions";

export default function CommentSection({
  postId,
  comments,
}: {
  postId: string;
  comments: PostComment[];
}) {
  const { commentDraft, setCommentDraft, handleAddComment } =
    useCommentActions(postId);

  return (
    <>
      {comments.length > 0 ? (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} postId={postId} comment={comment} />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
          placeholder="Write a comment..."
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
          className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
          disabled={commentDraft.trim().length === 0}
          onClick={handleAddComment}
          type="button"
        >
          Comment
        </button>
      </div>
    </>
  );
}
