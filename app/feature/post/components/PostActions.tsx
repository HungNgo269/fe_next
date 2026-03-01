"use client";

import { useCallback, useState } from "react";
import ActionButton from "./ui/ActionButton";
import { IconComment, IconLike, IconShare } from "@/app/share/components/icons";
import { useLikeActions } from "../hooks/useLikeActions";
import { useSharePost } from "../hooks/useSharePost";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";

export default function PostActions({
  postId,
  likedByMe,
  onClickComment,
}: {
  postId: string;
  likedByMe: boolean;
  onClickComment?: () => void;
}) {
  const { handleToggleLike } = useLikeActions(postId);
  const { handleShareToProfile, handleCopyShareLink, isSharingToProfile } =
    useSharePost(postId);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setIsShareMenuOpen(false), []),
  );

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      <ActionButton
        active={likedByMe}
        icon={<IconLike />}
        label="Like"
        onClick={handleToggleLike}
      />
      <ActionButton
        icon={<IconComment />}
        label="Comment"
        onClick={onClickComment}
      />
      <div className="relative" ref={shareMenuRef}>
        <ActionButton
          icon={<IconShare />}
          label="Share"
          onClick={() => setIsShareMenuOpen((prev) => !prev)}
        />
        {isShareMenuOpen ? (
          <div className=" absolute left-0 top-9 z-20 min-w-52 rounded-xl p-2">
            <button
              className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70 disabled:opacity-50"
              disabled={isSharingToProfile}
              onClick={() => {
                setIsShareMenuOpen(false);
                handleShareToProfile();
              }}
              type="button"
            >
              {isSharingToProfile ? "Sharing..." : "Share to your profile"}
            </button>
            <button
              className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
              onClick={async () => {
                setIsShareMenuOpen(false);
                await handleCopyShareLink();
              }}
              type="button"
            >
              Copy link
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
