"use client";

import { memo } from "react";
import type { User } from "../types/api.types";

import ActionChip from "./ui/ActionChip";
import Avatar from "./ui/Avatar";
import { IconImage, IconSmile, IconVideo } from "@/app/share/components/icons";
import { usePostUIStore } from "../stores/postStore";
import { useCreatePost } from "../hooks/useCreatePost";

function FeedComposer({
  currentUser,
}: {
  currentUser: User;
}) {
  const composerText = usePostUIStore((s) => s.composerText);
  const setComposerText = usePostUIStore((s) => s.setComposerText);
  const { handleCreatePost } = useCreatePost();

  const canPost = composerText.trim().length > 0;

  const onSubmit = () => {
    handleCreatePost(composerText);
    setComposerText("");
  };

  return (
    <div className="ui-card rounded-lg p-5">
      <div className="flex items-start gap-4">
        <Avatar
          avatar={currentUser.avatarUrl ?? undefined} gender={currentUser.gender}
        />
        <div className="flex-1">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            placeholder="Share something with your circle..."
            value={composerText}
            onChange={(event) => setComposerText(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="ui-text-muted flex flex-wrap items-center gap-2 text-xs">
          <ActionChip label="Live video" icon={<IconVideo />} />
          <ActionChip label="Photo" icon={<IconImage />} />
          <ActionChip label="Feeling" icon={<IconSmile />} />
        </div>
        <div className="flex items-center gap-3">
          <span className="ui-text-soft text-xs">{composerText.length}/240</span>
          <button
            className="rounded-full px-2 py-1 text-sm font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
            disabled={!canPost}
            onClick={onSubmit}
            type="button"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(FeedComposer);
