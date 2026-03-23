"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  deleteCurrentUserAvatar,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from "@/app/feature/profile/api/profileApi";
import type { UserProfile } from "@/app/feature/profile/types/profile";
import type {
  AvatarFormValues,
  ProfileDetailsFormValues,
} from "@/app/feature/profile/types/edit-profile.forms";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import { toast } from "sonner";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"] as const;
const PROFILE_SUBMIT_ERROR = "Sorry we can't upload your profile right now";

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
  bio: "",
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

const buildGenderOptions = (selectedGender: string) => {
  if (!selectedGender) {
    return [...BASE_GENDER_OPTIONS];
  }

  return BASE_GENDER_OPTIONS.includes(
    selectedGender as (typeof BASE_GENDER_OPTIONS)[number],
  )
    ? [...BASE_GENDER_OPTIONS]
    : [selectedGender, ...BASE_GENDER_OPTIONS];
};

export function useEditProfilePageController() {
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
    control: avatarControl,
    formState: { isSubmitting: isAvatarSubmitting },
  } = useForm<AvatarFormValues>({ mode: "onTouched" });

  const {
    register: registerDetails,
    handleSubmit: handleDetailsSubmit,
    control: detailsControl,
    reset: resetDetailsForm,
    formState: { isSubmitting: isDetailsSubmitting },
  } = useForm<ProfileDetailsFormValues>({
    mode: "onTouched",
    defaultValues: toDetailsDefaults(initialProfile),
  });

  const avatarFiles = useWatch({ control: avatarControl, name: "avatarFile" });
  const selectedAvatarFile = avatarFiles?.item(0) ?? null;

  const detailName = useWatch({ control: detailsControl, name: "name" }) ?? "";
  const detailEmail = useWatch({ control: detailsControl, name: "email" }) ?? "";
  const detailGender = useWatch({ control: detailsControl, name: "gender" }) ?? "";
  const detailBio = useWatch({ control: detailsControl, name: "bio" }) ?? "";

  const hasAvatarChanges = Boolean(selectedAvatarFile);
  const hasDetailsChanges =
    detailName.trim() !== (profile.name ?? "").trim() ||
    detailEmail.trim() !== (profile.email ?? "").trim() ||
    detailGender.trim().toUpperCase() !==
      (profile.gender ?? "").trim().toUpperCase() ||
    detailBio.trim() !== (profile.bio ?? "").trim();

  const selectedGender = detailGender.trim().toUpperCase();
  const genderOptions = useMemo(
    () => buildGenderOptions(selectedGender),
    [selectedGender],
  );

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
  }, [authProfile, resetAvatarForm, resetDetailsForm, setAuthenticatedProfile]);

  const onAvatarSubmitInvalid = () => {
    setAvatarSubmitError(PROFILE_SUBMIT_ERROR);
    toast.error(PROFILE_SUBMIT_ERROR);
  };

  const onDetailsSubmitInvalid = () => {
    setDetailsSubmitError(PROFILE_SUBMIT_ERROR);
    toast.error(PROFILE_SUBMIT_ERROR);
  };

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

    try {
      const result = await updateCurrentUserProfile({
        name: values.name,
        email: values.email,
        gender: values.gender,
        bio: values.bio ?? "",
      });

      if (!result.ok) {
        setDetailsSubmitError(PROFILE_SUBMIT_ERROR);
        toast.error(PROFILE_SUBMIT_ERROR);
        return;
      }

      setProfile(result.data);
      resetDetailsForm(toDetailsDefaults(result.data));
      syncAuthProfile(result.data, profile.id ?? authProfile?.id);
    } catch {
      setDetailsSubmitError(PROFILE_SUBMIT_ERROR);
      toast.error(PROFILE_SUBMIT_ERROR);
    } finally {
      setIsSaving(false);
    }
  }, onDetailsSubmitInvalid);

  return {
    profile,
    status: {
      isLoading,
      isUnauthorized,
      loadError,
    },
    avatarForm: {
      register: registerAvatar,
      isSubmitting: isAvatarSubmitting,
      submitError: avatarSubmitError,
      selectedFile: selectedAvatarFile,
      selectedFileName: selectedAvatarFile?.name,
      previewName: avatarPreviewName,
      previewUrl: avatarPreviewUrl,
      hasChanges: hasAvatarChanges,
      onDelete: onDeleteAvatar,
      onSubmit: onSubmitAvatar,
    },
    detailsForm: {
      register: registerDetails,
      control: detailsControl,
      isSubmitting: isDetailsSubmitting,
      isSaving,
      submitError: detailsSubmitError,
      bioValue: detailBio,
      genderOptions,
      hasChanges: hasDetailsChanges,
      onSubmit: onSubmitDetails,
    },
  };
}
