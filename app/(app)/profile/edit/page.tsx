"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import EditProfileAvatarForm from "@/app/feature/profile/components/edit-profile/EditProfileAvatarForm";
import EditProfileDetailsForm from "@/app/feature/profile/components/edit-profile/EditProfileDetailsForm";
import { useEditProfilePageViewModel } from "@/app/feature/profile/hooks/useEditProfilePageViewModel";

export default function EditProfilePage() {
  const vm = useEditProfilePageViewModel();

  return (
    <ProfileShell>
      {vm.isLoading ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
        </main>
      ) : vm.isUnauthorized ? (
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
      ) : vm.loadError ? (
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
            message={vm.loadError}
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
            isAvatarSubmitting={vm.isAvatarSubmitting}
            hasAvatarChanges={vm.hasAvatarChanges}
            avatarSubmitError={vm.avatarSubmitError}
            selectedAvatarFileName={vm.selectedAvatarFile?.name}
            hasCurrentAvatar={Boolean((vm.profile.avatar ?? "").trim())}
            avatarPreviewUrl={vm.avatarPreviewUrl}
            avatarPreviewName={vm.avatarPreviewName}
            registerAvatar={vm.registerAvatar}
            onDeleteAvatar={vm.onDeleteAvatar}
            onSubmitAvatar={vm.onSubmitAvatar}
          />

          <EditProfileDetailsForm
            isSaving={vm.isSaving}
            isDetailsSubmitting={vm.isDetailsSubmitting}
            hasDetailsChanges={vm.hasDetailsChanges}
            detailsSubmitError={vm.detailsSubmitError}
            detailBio={vm.detailBio}
            genderOptions={vm.genderOptions}
            detailsControl={vm.detailsControl}
            registerDetails={vm.registerDetails}
            onSubmitDetails={vm.onSubmitDetails}
          />
        </main>
      )}
    </ProfileShell>
  );
}
