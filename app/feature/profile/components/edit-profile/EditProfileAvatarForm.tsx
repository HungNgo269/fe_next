"use client";

import type { BaseSyntheticEvent } from "react";
import type { UseFormRegister } from "react-hook-form";
import { Loader2 } from "lucide-react";
import ProfileAvatarPreview from "@/app/feature/profile/components/ProfileAvatarPreview";
import type { AvatarFormValues } from "@/app/feature/profile/types/edit-profile.forms";

type EditProfileAvatarFormProps = {
  isAvatarSubmitting: boolean;
  hasAvatarChanges: boolean;
  avatarSubmitError: string;
  selectedAvatarFileName?: string;
  hasCurrentAvatar: boolean;
  avatarPreviewUrl: string;
  avatarPreviewName: string;
  registerAvatar: UseFormRegister<AvatarFormValues>;
  onDeleteAvatar: () => Promise<void>;
  onSubmitAvatar: (event?: BaseSyntheticEvent) => Promise<void>;
};

export default function EditProfileAvatarForm({
  isAvatarSubmitting,
  hasAvatarChanges,
  avatarSubmitError,
  selectedAvatarFileName,
  hasCurrentAvatar,
  avatarPreviewUrl,
  avatarPreviewName,
  registerAvatar,
  onDeleteAvatar,
  onSubmitAvatar,
}: EditProfileAvatarFormProps) {
  return (
    <form
      className="space-y-4 rounded-md p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmitAvatar(event);
      }}
    >
      <h2 className="text-lg font-semibold text-foreground">Avatar</h2>

      <div className="rounded-2xl border border-border p-4">
        <input
          accept="image/*"
          className="sr-only"
          disabled={isAvatarSubmitting}
          id="avatar-file-input"
          type="file"
          {...registerAvatar("avatarFile", {
            validate: (files) => Boolean(files?.length),
          })}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label
              className="relative block cursor-pointer"
              htmlFor="avatar-file-input"
            >
              <ProfileAvatarPreview
                avatarUrl={avatarPreviewUrl}
                name={avatarPreviewName}
                size="lg"
              />
              {isAvatarSubmitting ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
                  <Loader2 className="h-8 w-8 animate-spin text-foreground" />
                </div>
              ) : null}
            </label>

            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click avatar to choose image
              </p>
              {selectedAvatarFileName ? (
                <p className="text-xs text-foreground-muted">
                  {selectedAvatarFileName}
                </p>
              ) : (
                <p className="text-xs text-foreground-muted">JPG, PNG, WEBP</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-surface-hover disabled:opacity-50"
              disabled={isAvatarSubmitting || !hasCurrentAvatar}
              onClick={() => void onDeleteAvatar()}
              type="button"
            >
              Delete avatar
            </button>
            <button
              className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              disabled={isAvatarSubmitting || !hasAvatarChanges}
              type="submit"
            >
              {isAvatarSubmitting ? "Uploading..." : "Upload avatar"}
            </button>
          </div>
        </div>
      </div>

      {avatarSubmitError ? (
        <p className="text-base text-red-600">{avatarSubmitError}</p>
      ) : null}
    </form>
  );
}

