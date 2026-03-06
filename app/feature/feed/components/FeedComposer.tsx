"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@/app/feature/post/types/api.types";
import ActionChip from "@/app/feature/post/components/ui/ActionChip";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import { IconImage, IconSmile, IconVideo } from "@/app/share/components/icons";
import { usePostUIStore } from "@/app/feature/post/stores/postStore";
import { useCreatePost } from "@/app/feature/feed/hooks/useCreatePost";

type SelectedComposerImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_POST_IMAGE_FILES = 10;

function FeedComposer({ currentUser }: { currentUser: User }) {
  const composerText = usePostUIStore((s) => s.composerText);
  const setComposerText = usePostUIStore((s) => s.setComposerText);
  const { handleCreatePost } = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImages, setSelectedImages] = useState<SelectedComposerImage[]>(
    [],
  );
  const selectedImagesRef = useRef<SelectedComposerImage[]>([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(
    () => () => {
      for (const image of selectedImagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    },
    [],
  );

  const canPost = composerText.trim().length > 0;

  const clearImages = useCallback(() => {
    setSelectedImages((prev) => {
      for (const image of prev) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return [];
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const addImages = useCallback((files: FileList | null) => {
    if (!files) return;

    setSelectedImages((prev) => {
      const availableSlots = MAX_POST_IMAGE_FILES - prev.length;
      if (availableSlots <= 0) return prev;

      const nextImages = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, availableSlots)
        .map((file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        }));

      return [...prev, ...nextImages];
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setSelectedImages((prev) => {
      const image = prev.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const onSubmit = () => {
    handleCreatePost(
      composerText,
      selectedImages.map((image) => image.file),
    );
    setComposerText("");
    clearImages();
  };

  return (
    <div className=" rounded-md p-5">
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        multiple
        onChange={(event) => addImages(event.target.files)}
        type="file"
      />
      <div className="flex items-start gap-4">
        <Avatar
          avatar={currentUser.avatarUrl ?? undefined}
          gender={currentUser.gender}
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
      {selectedImages.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {selectedImages.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-xl border border-border/50"
            >
              <img
                alt={image.file.name || "Selected image"}
                className="h-24 w-full object-cover"
                src={image.previewUrl}
              />
              <button
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                onClick={() => removeImage(image.id)}
                type="button"
              >
                x
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="ui-text-muted flex flex-wrap items-center gap-2 text-xs">
          <ActionChip label="Live video" icon={<IconVideo />} />
          <ActionChip
            label={`Photo${selectedImages.length > 0 ? ` (${selectedImages.length})` : ""}`}
            icon={<IconImage />}
            onClick={() => fileInputRef.current?.click()}
          />
          <ActionChip label="Feeling" icon={<IconSmile />} />
        </div>
        <div className="flex items-center gap-3">
          <span className="ui-text-soft text-xs">
            {composerText.length}/240
          </span>
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
