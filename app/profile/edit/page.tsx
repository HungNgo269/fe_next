"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  deleteCurrentUserAvatar,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from "../../feature/profile/api/profileApi";
import ProfileAvatarPreview from "../../feature/profile/components/ProfileAvatarPreview";
import ProfileShell from "../../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../../feature/profile/components/ProfileStatusCard";
import type { UserProfile } from "../../feature/profile/types/profile";
import { useAppSessionStore } from "../../share/stores/appSessionStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"] as const;
const PROFILE_SUBMIT_ERROR = "Sorry we can't upload your profile right now";

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
  bio: "",
};

type AvatarFormValues = {
  avatarFile?: FileList;
};

type ProfileDetailsFormValues = {
  name: string;
  email: string;
  gender: string;
  bio: string;
};

const toDetailsDefaults = (profile: UserProfile): ProfileDetailsFormValues => ({
  name: profile.name ?? "",
  email: profile.email ?? "",
  gender: (profile.gender ?? "").trim().toUpperCase(),
  bio: profile.bio ?? "",
});

const toAuthSyncPayload = (profile: UserProfile, fallbackId?: string) => {
  const nextId = profile.id ?? fallbackId;
  if (!nextId) {
    return null;
  }

  return {
    id: nextId,
    name: profile.name,
    email: profile.email,
    gender: profile.gender,
    avatar: profile.avatar,
    bio: profile.bio ?? "",
  };
};

export default function EditProfilePage() {
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );

  const initialProfile: UserProfile = authProfile
    ? {
        id: authProfile.id,
        name: authProfile.name,
        email: authProfile.email,
        gender: authProfile.gender,
        avatar: authProfile.avatar,
        bio: authProfile.bio ?? "",
      }
    : { ...EMPTY_PROFILE };

  const [profile, setProfile] = useState<UserProfile>(() => initialProfile);
  const [isLoading, setIsLoading] = useState(!authProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [avatarSubmitError, setAvatarSubmitError] = useState("");
  const [detailsSubmitError, setDetailsSubmitError] = useState("");
  const [avatarPreviewObjectUrl, setAvatarPreviewObjectUrl] = useState("");

  const {
    register: registerAvatar,
    handleSubmit: handleAvatarSubmit,
    reset: resetAvatarForm,
    watch: watchAvatar,
    formState: { isSubmitting: isAvatarSubmitting },
  } = useForm<AvatarFormValues>({
    mode: "onTouched",
  });

  const {
    register: registerDetails,
    handleSubmit: handleDetailsSubmit,
    control: detailsControl,
    reset: resetDetailsForm,
    watch: watchDetails,
    formState: { isSubmitting: isDetailsSubmitting },
  } = useForm<ProfileDetailsFormValues>({
    mode: "onTouched",
    defaultValues: toDetailsDefaults(initialProfile),
  });

  const avatarFiles = watchAvatar("avatarFile");
  const selectedAvatarFile = avatarFiles?.item(0) ?? null;

  const detailName = watchDetails("name") ?? "";
  const detailEmail = watchDetails("email") ?? "";
  const detailGender = watchDetails("gender") ?? "";
  const detailBio = watchDetails("bio") ?? "";

  const hasAvatarChanges = Boolean(selectedAvatarFile);
  const hasDetailsChanges =
    detailName.trim() !== (profile.name ?? "").trim() ||
    detailEmail.trim() !== (profile.email ?? "").trim() ||
    detailGender.trim().toUpperCase() !==
      (profile.gender ?? "").trim().toUpperCase() ||
    detailBio.trim() !== (profile.bio ?? "").trim();

  const selectedGender = detailGender.trim().toUpperCase();
  const genderOptions = useMemo(() => {
    if (!selectedGender) {
      return [...BASE_GENDER_OPTIONS];
    }

    return BASE_GENDER_OPTIONS.includes(
      selectedGender as (typeof BASE_GENDER_OPTIONS)[number],
    )
      ? [...BASE_GENDER_OPTIONS]
      : [selectedGender, ...BASE_GENDER_OPTIONS];
  }, [selectedGender]);

  useEffect(() => {
    if (!selectedAvatarFile) {
      setAvatarPreviewObjectUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatarFile);
    setAvatarPreviewObjectUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedAvatarFile]);

  const avatarPreviewName = detailName.trim() || profile.name || "User";
  const avatarPreviewUrl = avatarPreviewObjectUrl || (profile.avatar ?? "");

  const syncAuthProfile = (nextProfile: UserProfile, fallbackId?: string) => {
    const authPayload = toAuthSyncPayload(nextProfile, fallbackId);
    if (authPayload) {
      setAuthenticatedProfile(authPayload);
    }
  };

  const onAvatarSubmitInvalid = () => {
    setAvatarSubmitError(PROFILE_SUBMIT_ERROR);
    toast.error(PROFILE_SUBMIT_ERROR);
  };

  const onDetailsSubmitInvalid = () => {
    setDetailsSubmitError(PROFILE_SUBMIT_ERROR);
    toast.error(PROFILE_SUBMIT_ERROR);
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (authProfile) {
        const nextProfile: UserProfile = {
          id: authProfile.id,
          name: authProfile.name,
          email: authProfile.email,
          gender: authProfile.gender,
          avatar: authProfile.avatar,
          bio: authProfile.bio ?? "",
        };

        setProfile(nextProfile);
        resetAvatarForm();
        resetDetailsForm(toDetailsDefaults(nextProfile));
        setIsUnauthorized(false);
        setLoadError("");
        setAvatarSubmitError("");
        setDetailsSubmitError("");
        setIsLoading(false);
        return;
      }

      const result = await getCurrentUserProfile();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setIsUnauthorized(
          result.error.status === 401 || result.error.status === 403,
        );
        setLoadError(PROFILE_SUBMIT_ERROR);
        setIsLoading(false);
        return;
      }

      setProfile(result.data);
      resetAvatarForm();
      resetDetailsForm(toDetailsDefaults(result.data));

      const authPayload = toAuthSyncPayload(result.data, result.data.id);
      if (authPayload) {
        setAuthenticatedProfile(authPayload);
      }

      setIsUnauthorized(false);
      setLoadError("");
      setAvatarSubmitError("");
      setDetailsSubmitError("");
      setIsLoading(false);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [
    authProfile,
    resetAvatarForm,
    resetDetailsForm,
    setAuthenticatedProfile,
  ]);

  const onSubmitAvatar = handleAvatarSubmit(async (values) => {
    if (isAvatarSubmitting || !hasAvatarChanges) {
      return;
    }

    const avatarFile = values.avatarFile?.item(0);
    if (!avatarFile) {
      setAvatarSubmitError(PROFILE_SUBMIT_ERROR);
      toast.error(PROFILE_SUBMIT_ERROR);
      return;
    }

    setAvatarSubmitError("");

    const result = await uploadCurrentUserAvatar(avatarFile);
    if (!result.ok) {
      setAvatarSubmitError(PROFILE_SUBMIT_ERROR);
      toast.error(PROFILE_SUBMIT_ERROR);
      return;
    }

    setProfile(result.data);
    resetAvatarForm();
    syncAuthProfile(result.data, profile.id ?? authProfile?.id);
  }, onAvatarSubmitInvalid);

  const onDeleteAvatar = async () => {
    if (isAvatarSubmitting || !(profile.avatar ?? "").trim()) {
      return;
    }

    setAvatarSubmitError("");

    const result = await deleteCurrentUserAvatar();
    if (!result.ok) {
      setAvatarSubmitError(PROFILE_SUBMIT_ERROR);
      toast.error(PROFILE_SUBMIT_ERROR);
      return;
    }

    setProfile(result.data);
    resetAvatarForm();
    syncAuthProfile(result.data, profile.id ?? authProfile?.id);
  };

  const onSubmitDetails = handleDetailsSubmit(async (values) => {
    if (isDetailsSubmitting || !hasDetailsChanges) {
      return;
    }

    setIsSaving(true);
    setDetailsSubmitError("");

    const result = await updateCurrentUserProfile({
      name: values.name,
      email: values.email,
      gender: values.gender,
      bio: values.bio ?? "",
    });

    if (!result.ok) {
      setDetailsSubmitError(PROFILE_SUBMIT_ERROR);
      toast.error(PROFILE_SUBMIT_ERROR);
      setIsSaving(false);
      return;
    }

    setProfile(result.data);
    resetDetailsForm(toDetailsDefaults(result.data));
    syncAuthProfile(result.data, profile.id ?? authProfile?.id);
    setIsSaving(false);
  }, onDetailsSubmitInvalid);

  return (
    <ProfileShell>
      {isLoading ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
        </main>
      ) : isUnauthorized ? (
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
      ) : loadError ? (
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
            message={loadError}
            title="Unable to load profile"
            variant="error"
          />
        </main>
      ) : (
        <main className="relative mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-12 sm:px-6">
          <header className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Edit profile
            </h1>
          </header>

          <form className="space-y-4 rounded-md p-6" onSubmit={onSubmitAvatar}>
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
                    {selectedAvatarFile ? (
                      <p className="text-xs text-foreground-muted">
                        {selectedAvatarFile.name}
                      </p>
                    ) : (
                      <p className="text-xs text-foreground-muted">
                        JPG, PNG, WEBP
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    className="rounded-full border border-border px-5 py-2 text-xs font-semibold transition-colors hover:bg-surface-hover disabled:opacity-50"
                    disabled={isAvatarSubmitting || !(profile.avatar ?? "").trim()}
                    onClick={onDeleteAvatar}
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

          <form className="space-y-4 rounded-md p-6" onSubmit={onSubmitDetails}>
            <h2 className="text-lg font-semibold text-foreground">
              Profile details
            </h2>

            <div>
              <label className="block text-md font-semibold">Bio</label>
              <textarea
                className="ui-input mt-2 min-h-24 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                disabled={isDetailsSubmitting}
                placeholder="Tell people about yourself..."
                {...registerDetails("bio", {
                  maxLength: 500,
                })}
              />
              <p className="mt-1 text-xs">{detailBio.trim().length}/500</p>
            </div>

            <div>
              <label className="block text-md font-semibold">Full name</label>
              <input
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                disabled={isDetailsSubmitting}
                placeholder="Your name"
                type="text"
                {...registerDetails("name", {
                  validate: (value) => value.trim().length > 0,
                })}
              />
            </div>

            <div>
              <label className="block text-md font-semibold">Email</label>
              <input
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                disabled={isDetailsSubmitting}
                placeholder="you@example.com"
                readOnly
                type="email"
                {...registerDetails("email", {
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                })}
              />
            </div>

            <div>
              <label className="block text-md font-semibold">Gender</label>
              <Controller
                control={detailsControl}
                name="gender"
                rules={{
                  validate: (value) => (value ?? "").trim().length > 0,
                }}
                render={({ field }) => (
                  <Select
                    disabled={isDetailsSubmitting}
                    onValueChange={(value) => field.onChange((value ?? "").toUpperCase())}
                    value={field.value || undefined}
                  >
                    <SelectTrigger className="mt-2 w-[180px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {genderOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {detailsSubmitError ? (
              <p className="text-base text-red-600">{detailsSubmitError}</p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                disabled={isSaving || isDetailsSubmitting || !hasDetailsChanges}
                type="submit"
              >
                {isSaving ? "Updating..." : "Update profile"}
              </button>
            </div>
          </form>
        </main>
      )}
    </ProfileShell>
  );
}
