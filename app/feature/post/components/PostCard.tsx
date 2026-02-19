import type { PostData } from "../types/feed";
import ActionButton from "./ui/ActionButton";
import Avatar from "./ui/Avatar";
import { IconComment, IconLike, IconShare } from "./icons";

type PostCardProps = {
  post: PostData;
  index: number;
  isEditing: boolean;
  editingText: string;
  commentDraft: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onChangeEditingText: (value: string) => void;
  onToggleLike: () => void;
  onShare: () => void;
  onChangeCommentDraft: (value: string) => void;
  onAddComment: () => void;
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
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onChangeEditingText,
  onToggleLike,
  onShare,
  onChangeCommentDraft,
  onAddComment,
}: PostCardProps) {
  const delayClass = postDelayClasses[index % postDelayClasses.length];

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
        <div className="flex items-center gap-2">
          <button
            className="ui-btn-ghost rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            onClick={onStartEdit}
            type="button"
          >
            Edit
          </button>
          <button
            className="ui-btn-danger rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            onClick={onDelete}
            type="button"
          >
            Delete
          </button>
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
                className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                onClick={onSaveEdit}
                type="button"
              >
                Save changes
              </button>
              <button
                className="ui-btn-ghost rounded-full px-4 py-2 text-xs font-semibold transition-colors"
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
        <span className="ui-text-soft text-2xs uppercase tracking-widest-xl">
          Community
        </span>
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
        {post.comments.map((comment) => (
          <div className="ui-subtle flex items-start gap-3 rounded-2xl px-3 py-2.5" key={comment.id}>
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
              <p className="ui-text-muted text-xs">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="ui-input flex-1 rounded-full px-4 py-2 text-xs outline-none transition-colors"
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => onChangeCommentDraft(event.target.value)}
        />
        <button
          className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
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
