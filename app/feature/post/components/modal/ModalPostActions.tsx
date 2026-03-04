"use client";

import ActionButton from "../ui/ActionButton";
import { IconLike, IconShare } from "@/app/share/components/icons";
import { useModalPostContentContext } from "./ModalPostContentContext";

export default function ModalPostActions() {
  const { likesCount, totalComments, likedByMe, handleToggleLike, handleShare } =
    useModalPostContentContext();

  return (
    <div className="post-detail-actions">
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="ui-text-muted text-xs">{likesCount} likes</span>
          <span className="ui-text-muted text-xs">&middot;</span>
          <span className="ui-text-muted text-xs">{totalComments} comments</span>
        </div>
      </div>
      <div className="flex gap-2 border-t border-border px-4 py-2">
        <ActionButton
          active={likedByMe}
          icon={<IconLike />}
          label="Like"
          onClick={handleToggleLike}
        />
        <ActionButton icon={<IconShare />} label="Share" onClick={handleShare} />
      </div>
    </div>
  );
}



