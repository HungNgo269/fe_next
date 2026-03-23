"use client";

import { useCallback, useState } from "react";
import ActionButton from "./ui/ActionButton";
import { IconComment, IconLike, IconShare } from "@/app/share/components/icons";
import { usePostLikeMutation } from "../mutations/usePostLikeMutation";
import { usePostShareMutation } from "../mutations/usePostShareMutation";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";

export default function PostActions({
  postId,
  likedByMe,
  likesCount,
  commentsCount,
  sharesCount,
  onClickComment,
}: {
  postId: string;
  likedByMe: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  onClickComment?: () => void;
}) {
  const { handleToggleLike } = usePostLikeMutation(postId, likedByMe);
  const { handleShareToProfile, handleCopyShareLink, isSharingToProfile } =
    usePostShareMutation(postId);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setIsShareMenuOpen(false), []),
  );

  return (
    <div className="flex flex-wrap gap-4 pt-3">
      <ActionButton
        active={likedByMe}
        icon={<IconLike />}
        count={likesCount}
        onClick={handleToggleLike}
      />
      <ActionButton
        icon={<IconComment />}
        count={commentsCount}
        onClick={onClickComment}
      />
      <div className="relative" ref={shareMenuRef}>
        <ActionButton
          icon={<IconShare />}
          count={sharesCount}
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

