import type { CommentData } from "../types/feed";
import CommentItem from "./CommentItem";

type CommentListProps = {
  comments: CommentData[];
  currentUserId: string;
  commentDraft: string;
  onChangeCommentDraft: (value: string) => void;
  onAddComment: () => void;
  onSaveCommentEdit: (commentId: string, content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onReportComment: () => void;
};

export default function CommentList({
  comments,
  currentUserId,
  commentDraft,
  onChangeCommentDraft,
  onAddComment,
  onSaveCommentEdit,
  onDeleteComment,
  onReportComment,
}: CommentListProps) {
  return (
    <>
      {comments.length > 0 ? (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isCommentOwner={comment.author.id === currentUserId}
              onSaveCommentEdit={onSaveCommentEdit}
              onDeleteComment={onDeleteComment}
              onReportComment={onReportComment}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => onChangeCommentDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && commentDraft.trim().length > 0) {
              event.preventDefault();
              onAddComment();
            }
          }}
        />
        <button
          className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
          disabled={commentDraft.trim().length === 0}
          onClick={onAddComment}
          type="button"
        >
          Comment
        </button>
      </div>
    </>
  );
}
