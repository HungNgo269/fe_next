"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/share/utils/auth-guard.client";
import {
  getCurrentUserProfile,
  updateCurrentUserProfileField,
} from "../feature/profile/api/profileApi";
import ProfileAvatarPreview from "../feature/profile/components/ProfileAvatarPreview";
import ProfileFieldCard from "../feature/profile/components/ProfileFieldCard";
import ProfileShell from "../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../feature/profile/components/ProfileStatusCard";
import type { EditableProfileField, UserProfile } from "../feature/profile/types/profile";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"];

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
};

const normalizeFieldValue = (field: EditableProfileField, value: string): string => {
  const trimmed = value.trim();
  return field === "gender" ? trimmed.toUpperCase() : trimmed;
};

const buildInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return "U";
  }
  return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
};

const validateField = (field: EditableProfileField, value: string): string | null => {
  const normalized = normalizeFieldValue(field, value);

  if ((field === "name" || field === "email" || field === "gender") && !normalized) {
    return "This field cannot be empty.";
  }
  if (
    field === "email" &&
    normalized &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    return "Email format is invalid.";
  }
  if (field === "avatar" && normalized) {
    const isAbsolute = /^https?:\/\//i.test(normalized);
    const isRelative = normalized.startsWith("/");
    if (!isAbsolute && !isRelative) {
      return "Avatar must start with http://, https://, or /.";
    }
  }

  return null;
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [savingField, setSavingField] = useState<EditableProfileField | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<EditableProfileField, string>>
  >({});
  const [fieldSuccess, setFieldSuccess] = useState<
    Partial<Record<EditableProfileField, string>>
  >({});

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const result = await getCurrentUserProfile();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setLoadError(result.error.messages[0] ?? "Unable to load your profile.");
        setIsLoading(false);
        return;
      }

      setProfile(result.data);
      setForm(result.data);
      setIsLoading(false);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const refreshProfile = async () => {
    setIsRefreshing(true);
    setLoadError("");

    const result = await getCurrentUserProfile();
    if (!result.ok) {
      setLoadError(result.error.messages[0] ?? "Unable to load your profile.");
      setIsRefreshing(false);
      return;
    }

    setProfile(result.data);
    setForm(result.data);
    setFieldErrors({});
    setFieldSuccess({});
    setIsRefreshing(false);
  };

  const handleFieldChange = (field: EditableProfileField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFieldSuccess((prev) => ({ ...prev, [field]: undefined }));
  };

  const hasChanged = (field: EditableProfileField) =>
    normalizeFieldValue(field, form[field]) !==
    normalizeFieldValue(field, profile[field]);

  const saveField = async (field: EditableProfileField) => {
    if (savingField) {
      return;
    }

    const nextValue = normalizeFieldValue(field, form[field]);
    const validationError = validateField(field, nextValue);
    if (validationError) {
      setFieldErrors((prev) => ({ ...prev, [field]: validationError }));
      setFieldSuccess((prev) => ({ ...prev, [field]: undefined }));
      return;
    }
    if (!hasChanged(field)) {
      return;
    }

    setSavingField(field);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setFieldSuccess((prev) => ({ ...prev, [field]: undefined }));

    const result = await updateCurrentUserProfileField(field, nextValue);
    if (!result.ok) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: result.error.messages[0] ?? "Update failed.",
      }));
      setSavingField(null);
      return;
    }

    const optimisticProfile: UserProfile = { ...profile, [field]: nextValue };
    const mergedProfile = result.data
      ? { ...optimisticProfile, ...result.data }
      : optimisticProfile;
    setProfile(mergedProfile);
    setForm(mergedProfile);
    setFieldSuccess((prev) => ({ ...prev, [field]: "Updated successfully." }));
    setSavingField(null);
  };

  const avatarPreview = normalizeFieldValue("avatar", form.avatar);
  const initials = buildInitials(form.name);
  const normalizedGender = normalizeFieldValue("gender", form.gender);
  const genderOptions =
    normalizedGender && !BASE_GENDER_OPTIONS.includes(normalizedGender)
      ? [normalizedGender, ...BASE_GENDER_OPTIONS]
      : BASE_GENDER_OPTIONS;
  const hasProfileData = Boolean(
    profile.name || profile.email || profile.gender || profile.avatar || profile.id,
  );

  return (
    <AuthGuard
      fallback={
        <ProfileShell>
          <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
            <ProfileStatusCard message="Checking session..." />
          </main>
        </ProfileShell>
      }
    >
      <ProfileShell>
        {isLoading ? (
          <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
            <ProfileStatusCard message="Loading profile..." />
          </main>
        ) : !hasProfileData && loadError ? (
          <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
            <ProfileStatusCard
              action={
                <button
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  onClick={() => void refreshProfile()}
                  type="button"
                >
                  Try again
                </button>
              }
              message={loadError}
              title="Unable to load profile"
              variant="error"
            />
          </main>
        ) : (
          <main className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest-xl text-slate-500">
                  Account
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  Your profile
                </h1>
                <p className="text-sm text-slate-600">
                  Update each field separately and keep your account info current.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRefreshing}
                  onClick={() => void refreshProfile()}
                  type="button"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
                <Link
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                  href="/"
                >
                  Back to feed
                </Link>
              </div>
            </header>

            {loadError ? (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
                {loadError}
              </div>
            ) : null}

            <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft sm:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <ProfileAvatarPreview
                  avatarUrl={avatarPreview}
                  fallbackInitials={initials}
                  name={form.name}
                />
                <div>
                  <p className="text-xl font-semibold text-slate-900">
                    {form.name || "Unnamed user"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {form.email || "No email"}
                  </p>
                </div>
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <ProfileFieldCard
                disabled={Boolean(savingField) || !hasChanged("avatar")}
                errorMessage={fieldErrors.avatar}
                isSubmitting={savingField === "avatar"}
                label="Avatar URL"
                onSubmit={() => void saveField("avatar")}
                submitLabel="Update avatar"
                submittingLabel="Updating..."
                successMessage={fieldSuccess.avatar}
              >
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
                  onChange={(event) =>
                    handleFieldChange("avatar", event.target.value)
                  }
                  placeholder="https://example.com/avatar.png"
                  type="text"
                  value={form.avatar}
                />
              </ProfileFieldCard>

              <ProfileFieldCard
                disabled={Boolean(savingField) || !hasChanged("name")}
                errorMessage={fieldErrors.name}
                isSubmitting={savingField === "name"}
                label="Full name"
                onSubmit={() => void saveField("name")}
                submitLabel="Update name"
                submittingLabel="Updating..."
                successMessage={fieldSuccess.name}
              >
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Your name"
                  type="text"
                  value={form.name}
                />
              </ProfileFieldCard>

              <ProfileFieldCard
                disabled={Boolean(savingField) || !hasChanged("email")}
                errorMessage={fieldErrors.email}
                isSubmitting={savingField === "email"}
                label="Email"
                onSubmit={() => void saveField("email")}
                submitLabel="Update email"
                submittingLabel="Updating..."
                successMessage={fieldSuccess.email}
              >
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
                  onChange={(event) => handleFieldChange("email", event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                />
              </ProfileFieldCard>

              <ProfileFieldCard
                disabled={Boolean(savingField) || !hasChanged("gender")}
                errorMessage={fieldErrors.gender}
                isSubmitting={savingField === "gender"}
                label="Gender"
                onSubmit={() => void saveField("gender")}
                submitLabel="Update gender"
                submittingLabel="Updating..."
                successMessage={fieldSuccess.gender}
              >
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400"
                  onChange={(event) =>
                    handleFieldChange("gender", event.target.value)
                  }
                  value={form.gender}
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </ProfileFieldCard>
            </div>
          </main>
        )}
      </ProfileShell>
    </AuthGuard>
  );
}
