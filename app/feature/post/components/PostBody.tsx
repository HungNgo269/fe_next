"use client";

import Image from "next/image";
import { useAutoResizeTextarea } from "@/app/share/hooks/useAutoResizeTextarea";
import { usePostMutations } from "../mutations/usePostMutations";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"];

const isVideoUrl = (url: string) => {
  const normalized = url.toLowerCase();
  return (
    VIDEO_EXTENSIONS.some((ext) => normalized.includes(ext)) ||
    normalized.includes("/video/upload/")
  );
};

export default function PostBody({
  postId,
  content,
  mediaUrls,
  onClickContent,
}: {
  postId: string;
  content: string;
  mediaUrls?: string[];
  onClickContent?: () => void;
}) {
  const {
    isEditing,
    editingText,
    setEditingText,
    handleSaveEdit,
    handleCancelEdit,
  } = usePostMutations(postId);
  const editTextareaRef = useAutoResizeTextarea<HTMLTextAreaElement>(
    editingText,
    { minHeight: 96, maxHeight: 320 },
  );

  return (
    <div className="mt-4">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            ref={editTextareaRef}
            rows={3}
            value={editingText}
            onChange={(event) => setEditingText(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                editingText.trim().length > 0
              ) {
                event.preventDefault();
                handleSaveEdit();
              }
            }}
          />
          <div className="flex items-center gap-2">
            <button
              className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
              onClick={handleSaveEdit}
              type="button"
            >
              Save changes
            </button>
            <button
              className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
              onClick={handleCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="ui-text-muted cursor-pointer whitespace-pre-line break-words text-sm leading-6"
          onClick={onClickContent}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClickContent?.();
          }}
        >
          {content}
        </p>
      )}

      {mediaUrls && mediaUrls.length > 0 ? (
        <div
          className="mt-4 cursor-pointer overflow-hidden rounded-2xl border border-border"
          onClick={onClickContent}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClickContent?.();
          }}
        >
          {isVideoUrl(mediaUrls[0]) ? (
            <video
              className="h-72 w-full bg-black object-cover sm:h-96"
              controls
              preload="metadata"
              src={mediaUrls[0]}
            />
          ) : (
            <Image
              alt="Post media"
              className="h-72 w-full object-cover sm:h-96"
              loading="lazy"
              src={mediaUrls[0]}
              width={1280}
              height={960}
              sizes="100vw"
              unoptimized
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

