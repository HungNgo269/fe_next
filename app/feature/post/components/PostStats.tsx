export default function PostStats({
  likes,
  commentsCount,
  shares,
  onClickComments,
}: {
  likes: number;
  commentsCount: number;
  shares: number;
  onClickComments?: () => void;
}) {
  return (
    <div className="ui-text-muted mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-4">
        <span>{likes} likes</span>
        <button
          className="cursor-pointer transition-opacity hover:opacity-70"
          onClick={onClickComments}
          type="button"
        >
        Comment
        </button>
        <span>{shares} shares</span>
      </div>
    </div>
  );
}
