"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  deleteCurrentUserAvatar,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from "@/app/feature/profile/api/profileApi";
import type { UserProfile } from "@/app/feature/profile/types/profile";
import type {
  AvatarFormValues,
  ProfileDetailsFormValues,
} from "@/app/feature/profile/types/edit-profile.forms";

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

type UseEditProfilePageControllerOptions = {
  initialProfile: UserProfile | null;
  isUnauthorized: boolean;
  initialLoadError: string;
};

export function useEditProfilePageController({
  initialProfile,
  isUnauthorized,
  initialLoadError,
}: UseEditProfilePageControllerOptions) {
  const router = useRouter();
  const resolvedInitialProfile = initialProfile ?? { ...EMPTY_PROFILE };

  const [profile, setProfile] = useState<UserProfile>(() => resolvedInitialProfile);
  const [isSaving, setIsSaving] = useState(false);
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
    defaultValues: toDetailsDefaults(resolvedInitialProfile),
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

  useEffect(() => {
    setProfile(resolvedInitialProfile);
    resetAvatarForm();
    resetDetailsForm(toDetailsDefaults(resolvedInitialProfile));
    setAvatarSubmitError("");
    setDetailsSubmitError("");
  }, [resolvedInitialProfile, resetAvatarForm, resetDetailsForm]);

  const avatarPreviewName = detailName.trim() || profile.name || "User";
  const avatarPreviewUrl = avatarPreviewObjectUrl || (profile.avatar ?? "");

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
    router.refresh();
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
    router.refresh();
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
      router.refresh();
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
      isLoading: false,
      isUnauthorized,
      loadError: initialLoadError,
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
