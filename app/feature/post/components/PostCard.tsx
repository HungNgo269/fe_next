import { useEffect, useRef, useState } from "react";
import type { PostData } from "../types/feed";
import ActionButton from "./ui/ActionButton";
import Avatar from "./ui/Avatar";
import { IconComment, IconLike, IconMoreVertical, IconShare } from "./icons";

type PostCardProps = {
  post: PostData;
  index: number;
  isEditing: boolean;
  editingText: string;
  commentDraft: string;
  currentUserId: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onChangeEditingText: (value: string) => void;
  onToggleLike: () => void;
  onShare: () => void;
  onChangeCommentDraft: (value: string) => void;
  onAddComment: () => void;
  onSaveCommentEdit: (commentId: string, content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onReportPost: () => void;
  onReportComment: () => void;
};

const postDelayClasses = [
  "animate-delay-120",
  "animate-delay-200",
  "animate-delay-280",
  "animate-delay-360",
  "animate-delay-440",
];

export default function PostCard({
  post,
  index,
  isEditing,
  editingText,
  commentDraft,
  currentUserId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onChangeEditingText,
  onToggleLike,
  onShare,
  onChangeCommentDraft,
  onAddComment,
  onSaveCommentEdit,
  onDeleteComment,
  onReportPost,
  onReportComment,
}: PostCardProps) {
  const delayClass = postDelayClasses[index % postDelayClasses.length];
  const postMenuRef = useRef<HTMLDivElement | null>(null);
  const commentMenuRef = useRef<HTMLDivElement | null>(null);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const isPostOwner = post.author.id === currentUserId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (postMenuRef.current && !postMenuRef.current.contains(target)) {
        setIsPostMenuOpen(false);
      }
      if (commentMenuRef.current && !commentMenuRef.current.contains(target)) {
        setOpenCommentMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const startEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
    setOpenCommentMenuId(null);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const saveEditComment = async (commentId: string) => {
    const ok = await onSaveCommentEdit(commentId, editingCommentText);
    if (ok) {
      cancelEditComment();
    }
  };

  const removeComment = async (commentId: string) => {
    const ok = await onDeleteComment(commentId);
    if (ok) {
      setOpenCommentMenuId(null);
      if (editingCommentId === commentId) {
        cancelEditComment();
      }
    }
  };

  return (
    <article className={`ui-card rounded-lg p-5 ${delayClass}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            initials={post.author.initials}
            colorClass={post.author.colorClass}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {post.author.name}
              <span className="ui-text-muted ml-2 text-xs font-medium">
                @{post.author.handle}
              </span>
            </p>
            <p className="ui-text-muted text-xs">
              {post.time} · {post.audience}
            </p>
          </div>
        </div>

        <div className="relative" ref={postMenuRef}>
          <button
            className="ui-text-muted rounded-full p-2 transition-opacity hover:opacity-70"
            onClick={() => setIsPostMenuOpen((prev) => !prev)}
            type="button"
          >
            <IconMoreVertical />
          </button>
          {isPostMenuOpen ? (
            <div className="ui-card absolute right-0 top-10 z-20 min-w-36 rounded-xl p-2">
              {isPostOwner ? (
                <>
                  <button
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                    onClick={() => {
                      setIsPostMenuOpen(false);
                      onStartEdit();
                    }}
                    type="button"
                  >
                    Edit post
                  </button>
                  <button
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                    onClick={() => {
                      setIsPostMenuOpen(false);
                      onDelete();
                    }}
                    type="button"
                  >
                    Delete post
                  </button>
                </>
              ) : (
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsPostMenuOpen(false);
                    onReportPost();
                  }}
                  type="button"
                >
                  Report post
                </button>
              )}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
              value={editingText}
              onChange={(event) => onChangeEditingText(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <button
                className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
                onClick={onSaveEdit}
                type="button"
              >
                Save changes
              </button>
              <button
                className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                onClick={onCancelEdit}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="ui-text-muted text-sm leading-6">{post.content}</p>
        )}
      </div>

      {post.media ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div
            className={`flex h-44 flex-col items-start justify-end bg-cover p-4 text-sm text-foreground ${post.media.gradientClass}`}
          >
            <p className="text-sm font-semibold">{post.media.title}</p>
            <p className="ui-text-muted text-xs">{post.media.subtitle}</p>
          </div>
        </div>
      ) : null}

      <div className="ui-text-muted mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <span>{post.likes} likes</span>
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        <ActionButton
          active={post.likedByMe}
          icon={<IconLike />}
          label="Like"
          onClick={onToggleLike}
        />
        <ActionButton icon={<IconComment />} label="Comment" />
        <ActionButton icon={<IconShare />} label="Share" onClick={onShare} />
      </div>

      <div className="mt-4 space-y-3">
        {post.comments.map((comment) => {
          const isCommentOwner = comment.author.id === currentUserId;
          const isEditingComment = editingCommentId === comment.id;
          return (
            <div
              className="ui-subtle group relative flex items-start gap-3 rounded-2xl px-3 py-2.5"
              key={comment.id}
            >
              <Avatar
                initials={comment.author.initials}
                colorClass={comment.author.colorClass}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">
                  {comment.author.name}
                  <span className="ui-text-muted ml-2 text-2xs font-normal">
                    {comment.time}
                  </span>
                </p>
                {isEditingComment ? (
                  <div className="mt-1 space-y-2">
                    <input
                      className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
                      onChange={(event) => setEditingCommentText(event.target.value)}
                      value={editingCommentText}
                    />
                    <div className="flex items-center gap-3">
                      <button
                        className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
                        onClick={() => void saveEditComment(comment.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                        onClick={cancelEditComment}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="ui-text-muted text-xs">{comment.text}</p>
                )}
              </div>

              <div
                className="relative ml-2 self-start"
                ref={openCommentMenuId === comment.id ? commentMenuRef : null}
              >
                <button
                  className="ui-text-muted rounded-full p-1.5 opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100 focus:opacity-100"
                  onClick={() =>
                    setOpenCommentMenuId((prev) =>
                      prev === comment.id ? null : comment.id,
                    )
                  }
                  type="button"
                >
                  <IconMoreVertical />
                </button>
                {openCommentMenuId === comment.id ? (
                  <div className="ui-card absolute right-0 top-8 z-20 min-w-36 rounded-xl p-2">
                    {isCommentOwner ? (
                      <>
                        <button
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                          onClick={() =>
                            startEditComment(comment.id, comment.text)
                          }
                          type="button"
                        >
                          Edit comment
                        </button>
                        <button
                          className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                          onClick={() => void removeComment(comment.id)}
                          type="button"
                        >
                          Delete comment
                        </button>
                      </>
                    ) : (
                      <button
                        className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                        onClick={() => {
                          setOpenCommentMenuId(null);
                          onReportComment();
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
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => onChangeCommentDraft(event.target.value)}
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
    </article>
  );
}
