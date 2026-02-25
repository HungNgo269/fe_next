import ActionButton from "./ui/ActionButton";
import { IconComment, IconLike, IconShare } from "@/app/share/components/icons";

type PostActionsProps = {
  likedByMe: boolean;
  onToggleLike: () => void;
  onShare: () => void;
};

export default function PostActions({
  likedByMe,
  onToggleLike,
  onShare,
}: PostActionsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      <ActionButton
        active={likedByMe}
        icon={<IconLike />}
        label="Like"
        onClick={onToggleLike}
      />
      <ActionButton icon={<IconComment />} label="Comment" />
      <ActionButton icon={<IconShare />} label="Share" onClick={onShare} />
    </div>
  );
}
