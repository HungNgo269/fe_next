"use client";

import {
  IconComment,
  IconLike,
  IconShare,
} from "@/app/share/components/icons";
import { formatPostDate } from "@/app/share/utils/format";
import {
  useModalPostDataContext,
  useModalPostActionsContext,
} from "./ModalPostContentContext";

export default function ModalPostActions() {
  const { likedByMe, likesCount, post, totalComments } =
    useModalPostDataContext();
  const { handleToggleLike, handleShare } = useModalPostActionsContext();
  const postDate = formatPostDate(post.createdAt);

  return (
    <div className="post-detail-actions">
      <div className="flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            aria-label="Like post"
            className={`rounded-full p-1.5 transition-opacity hover:opacity-70 ${
              likedByMe ? "text-like" : "text-foreground"
            }`}
            onClick={handleToggleLike}
            type="button"
          >
            <IconLike />
          </button>
          <button
            aria-label="Focus comment input"
            className="rounded-full p-1.5 text-foreground transition-opacity hover:opacity-70"
            onClick={() =>
              document.getElementById("modal-post-comment-input")?.focus()
            }
            type="button"
          >
            <IconComment />
          </button>
          <button
            aria-label="Share post"
            className="rounded-full p-1.5 text-foreground transition-opacity hover:opacity-70"
            onClick={handleShare}
            type="button"
          >
            <IconShare />
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 pt-0.5">
        <p className="text-sm font-semibold text-foreground">
          {likesCount.toLocaleString("en-US")} likes
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="ui-text-muted">{postDate}</span>
          <span className="ui-text-muted">&middot;</span>
          <span className="ui-text-muted">
            {totalComments.toLocaleString("en-US")} comments
          </span>
        </div>
      </div>
    </div>
  );
}
