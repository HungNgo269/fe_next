"use client";

import ActionButton from "./ui/ActionButton";
import { IconComment, IconLike, IconShare } from "@/app/share/components/icons";
import { useLikeMutations } from "../hooks/useLikeMutations";

export default function PostActions({
  postId,
  likedByMe,
}: {
  postId: string;
  likedByMe: boolean;
}) {
  const { handleToggleLike, handleShare } = useLikeMutations(postId);

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      <ActionButton
        active={likedByMe}
        icon={<IconLike />}
        label="Like"
        onClick={handleToggleLike}
      />
      <ActionButton icon={<IconComment />} label="Comment" />
      <ActionButton icon={<IconShare />} label="Share" onClick={handleShare} />
    </div>
  );
}
