"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import EditProfileAvatarForm from "@/app/feature/profile/components/edit-profile/EditProfileAvatarForm";
import EditProfileDetailsForm from "@/app/feature/profile/components/edit-profile/EditProfileDetailsForm";
import { useEditProfilePageController } from "@/app/feature/profile/controllers/useEditProfilePageController";

export default function EditProfilePage() {
  const controller = useEditProfilePageController();
  const { profile, status, avatarForm, detailsForm } = controller;

  return (
    <ProfileShell>
      {status.isLoading ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
        </main>
      ) : status.isUnauthorized ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                href="/login"
              >
                Sign in
              </Link>
            }
            message="Please sign in to edit your profile."
            title="Profile is locked"
            variant="error"
          />
        </main>
      ) : status.loadError ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                href="/profile"
              >
                Back to profile
              </Link>
            }
            message={status.loadError}
            title="Unable to load profile"
            variant="error"
          />
        </main>
      ) : (
        <main className="relative mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-12 sm:px-6">
          <header className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Edit profile</h1>
          </header>

          <EditProfileAvatarForm
            isAvatarSubmitting={avatarForm.isSubmitting}
            hasAvatarChanges={avatarForm.hasChanges}
            avatarSubmitError={avatarForm.submitError}
            selectedAvatarFileName={avatarForm.selectedFileName}
            hasCurrentAvatar={Boolean((profile.avatar ?? "").trim())}
            avatarPreviewUrl={avatarForm.previewUrl}
            avatarPreviewName={avatarForm.previewName}
            registerAvatar={avatarForm.register}
            onDeleteAvatar={avatarForm.onDelete}
            onSubmitAvatar={avatarForm.onSubmit}
          />

          <EditProfileDetailsForm
            isSaving={detailsForm.isSaving}
            isDetailsSubmitting={detailsForm.isSubmitting}
            hasDetailsChanges={detailsForm.hasChanges}
            detailsSubmitError={detailsForm.submitError}
            detailBio={detailsForm.bioValue}
            genderOptions={detailsForm.genderOptions}
            detailsControl={detailsForm.control}
            registerDetails={detailsForm.register}
            onSubmitDetails={detailsForm.onSubmit}
          />
        </main>
      )}
    </ProfileShell>
  );
}
