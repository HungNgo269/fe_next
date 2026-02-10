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
    <article
      className={`rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft animate-fade-up ${delayClass}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            initials={post.author.initials}
            colorClass={post.author.colorClass}
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {post.author.name}
              <span className="ml-2 text-xs font-medium text-slate-500">
                @{post.author.handle}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              {post.time} · {post.audience}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            onClick={onStartEdit}
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-rose-500 transition-colors hover:border-rose-200 hover:text-rose-600"
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
              className="min-h-composer w-full resize-none rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
              value={editingText}
              onChange={(event) => onChangeEditingText(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                onClick={onSaveEdit}
                type="button"
              >
                Save changes
              </button>
              <button
                className="rounded-full border border-slate-200/70 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                onClick={onCancelEdit}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-700">{post.content}</p>
        )}
      </div>

      {post.media ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70">
          <div
            className={`flex h-44 flex-col items-start justify-end bg-cover p-4 text-sm text-slate-900 ${post.media.gradientClass}`}
          >
            <p className="text-sm font-semibold">{post.media.title}</p>
            <p className="text-xs text-slate-600">{post.media.subtitle}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{post.likes} likes</span>
          <span>{post.comments.length} comments</span>
          <span>{post.shares} shares</span>
        </div>
        <span className="text-2xs uppercase tracking-widest-xl text-slate-400">
          Community
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/70 pt-3">
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
          <div
            className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-2.5"
            key={comment.id}
          >
            <Avatar
              initials={comment.author.initials}
              colorClass={comment.author.colorClass}
            />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900">
                {comment.author.name}
                <span className="ml-2 text-2xs font-normal text-slate-500">
                  {comment.time}
                </span>
              </p>
              <p className="text-xs text-slate-600">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="flex-1 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs text-slate-700 outline-none transition-colors focus:border-slate-400"
          placeholder="Write a comment..."
          value={commentDraft}
          onChange={(event) => onChangeCommentDraft(event.target.value)}
        />
        <button
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
