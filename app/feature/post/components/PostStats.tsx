type PostStatsProps = {
  likes: number;
  commentsCount: number;
  shares: number;
};

export default function PostStats({ likes, commentsCount, shares }: PostStatsProps) {
  return (
    <div className="ui-text-muted mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-4">
        <span>{likes} likes</span>
        <span>{commentsCount} comments</span>
        <span>{shares} shares</span>
      </div>
    </div>
  );
}
