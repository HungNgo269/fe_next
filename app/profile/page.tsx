"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCurrentUserProfile,
  updateCurrentUserProfileField,
} from "../feature/profile/api/profileApi";
import ProfileAvatarPreview from "../feature/profile/components/ProfileAvatarPreview";
import ProfileFieldCard from "../feature/profile/components/ProfileFieldCard";
import ProfileShell from "../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../feature/profile/components/ProfileStatusCard";
import type {
  EditableProfileField,
  UserProfile,
} from "../feature/profile/types/profile";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"];

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
};

const normalizeFieldValue = (
  field: EditableProfileField,
  value: string,
): string => {
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

const validateField = (
  field: EditableProfileField,
  value: string,
): string | null => {
  const normalized = normalizeFieldValue(field, value);

  if (
    (field === "name" || field === "email" || field === "gender") &&
    !normalized
  ) {
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
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [savingField, setSavingField] = useState<EditableProfileField | null>(
    null,
  );
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
        setIsUnauthorized(
          result.error.status === 401 || result.error.status === 403,
        );
        setLoadError(
          result.error.messages[0] ?? "Unable to load your profile.",
        );
        setIsLoading(false);
        return;
      }

      setIsUnauthorized(false);
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
      setIsUnauthorized(
        result.error.status === 401 || result.error.status === 403,
      );
      setLoadError(result.error.messages[0] ?? "Unable to load your profile.");
      setIsRefreshing(false);
      return;
    }

    setIsUnauthorized(false);
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
    profile.name ||
    profile.email ||
    profile.gender ||
    profile.avatar ||
    profile.id,
  );

  return (
    <ProfileShell>
      {isLoading ? (
        <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard message="Loading profile..." />
        </main>
      ) : isUnauthorized ? (
        <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                  href="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="ui-btn-ghost rounded-full px-5 py-2 text-xs font-semibold transition"
                  href="/"
                >
                  Back to feed
                </Link>
              </div>
            }
            message="You can browse the app without logging in, but your personal profile is only available after sign-in."
            title="Profile is locked"
            variant="error"
          />
        </main>
      ) : !hasProfileData && loadError ? (
        <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard
            action={
              <button
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
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
              <p className="ui-text-muted text-xs font-semibold uppercase tracking-widest-xl">
                Account
              </p>
              <h1 className="text-3xl font-semibold text-foreground">Your profile</h1>
              <p className="ui-text-muted text-sm">
                Update each field separately and keep your account info current.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="ui-btn-ghost rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRefreshing}
                onClick={() => void refreshProfile()}
                type="button"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                className="ui-btn-primary rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                href="/"
              >
                Back to feed
              </Link>
            </div>
          </header>

          {loadError ? (
            <div className="ui-alert-warning rounded-2xl px-4 py-3 text-sm">
              {loadError}
            </div>
          ) : null}

          <section className="ui-card rounded-lg p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ProfileAvatarPreview
                avatarUrl={avatarPreview}
                fallbackInitials={initials}
                name={form.name}
              />
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {form.name || "Unnamed user"}
                </p>
                <p className="ui-text-muted text-sm">{form.email || "No email"}</p>
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
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
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
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
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
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
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
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
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
  );
}
