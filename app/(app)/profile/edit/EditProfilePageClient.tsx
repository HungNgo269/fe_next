"use client";

import Link from "next/link";
import ProfileShell from "@/app/feature/profile/components/ProfileShell";
import EditProfileAvatarForm from "@/app/feature/profile/components/edit-profile/EditProfileAvatarForm";
import EditProfileDetailsForm from "@/app/feature/profile/components/edit-profile/EditProfileDetailsForm";
import { useEditProfilePageController } from "@/app/feature/profile/controllers/useEditProfilePageController";
import EditProfilePageSkeleton from "@/app/feature/profile/skeleton/EditProfilePageSkeleton";
import AppPageState from "@/app/share/components/AppPageState";
import type { AccessState } from "@/app/share/utils/access-state";
import type { UserProfile } from "@/app/feature/profile/types/profile";

type EditProfilePageClientProps = {
  initialProfile: UserProfile | null;
  accessState: AccessState;
  loadError: string;
};

export default function EditProfilePageClient({
  initialProfile,
  accessState,
  loadError,
}: EditProfilePageClientProps) {
  const controller = useEditProfilePageController({
    initialProfile,
    initialAccessState: accessState,
    initialLoadError: loadError,
  });
  const { profile, status, avatarForm, detailsForm } = controller;
  const profileHref = profile.handle
    ? `/profile/${profile.handle}`
    : profile.id
      ? `/profile/${profile.id}`
      : "/";

  const renderState = () => {
    switch (status.accessState.kind) {
      case "unauthenticated":
        return (
          <AppPageState
            title="Sign in to edit your profile"
            message="Editing your profile requires an active session. The route guard should normally redirect before this page renders."
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/login"
              >
                Sign in
              </Link>
            }
            secondaryAction={
              <Link
                className="ui-btn-ghost rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/"
              >
                Continue browsing
              </Link>
            }
            tone="warning"
          />
        );
      case "forbidden":
        return (
          <AppPageState
            title="You can't edit this profile"
            message="This profile is not available for editing with your current account."
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href={profileHref}
              >
                Back to profile
              </Link>
            }
            tone="error"
          />
        );
      case "payment_required":
      case "not_found":
        return (
          <AppPageState
            title="Profile not found"
            message="The profile you were trying to edit does not exist anymore or the link is invalid."
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href="/"
              >
                Back to home
              </Link>
            }
            tone="error"
          />
        );
      case "error":
        return (
          <AppPageState
            title="Unable to load profile"
            message={status.loadError}
            action={
              <Link
                className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                href={profileHref}
              >
                Back to profile
              </Link>
            }
            tone="error"
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProfileShell>
      {status.isLoading ? (
        <EditProfilePageSkeleton />
      ) : status.accessState.kind !== "ok" ? (
        renderState()
      ) : status.loadError ? (
        <AppPageState
          title="Unable to load profile"
          message={status.loadError}
          action={
            <Link
              className="ui-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              href={profileHref}
            >
              Back to profile
            </Link>
          }
          tone="error"
        />
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
