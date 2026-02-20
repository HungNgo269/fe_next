"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../../feature/profile/api/profileApi";
import ProfileShell from "../../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../../feature/profile/components/ProfileStatusCard";
import type { UserProfile } from "../../feature/profile/types/profile";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"];

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
};

const normalizeFieldValue = (field: keyof UserProfile, value: string): string => {
  const trimmed = value.trim();
  return field === "gender" ? trimmed.toUpperCase() : trimmed;
};

const validateForm = (form: UserProfile): string | null => {
  if (!form.name.trim() || !form.email.trim() || !form.gender.trim()) {
    return "Name, email, and gender are required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Email format is invalid.";
  }

  if (form.avatar.trim()) {
    const isAbsolute = /^https?:\/\//i.test(form.avatar.trim());
    const isRelative = form.avatar.trim().startsWith("/");
    if (!isAbsolute && !isRelative) {
      return "Avatar must start with http://, https://, or /.";
    }
  }

  return null;
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const result = await getCurrentUserProfile();
      if (!active) {
        return;
      }

      if (!result.ok) {
        setIsUnauthorized(result.error.status === 401 || result.error.status === 403);
        setError(result.error.messages[0] ?? "Unable to load profile.");
        setIsLoading(false);
        return;
      }

      setProfile(result.data);
      setForm(result.data);
      setIsUnauthorized(false);
      setError("");
      setIsLoading(false);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const hasChanges =
    normalizeFieldValue("name", form.name) !== normalizeFieldValue("name", profile.name) ||
    normalizeFieldValue("email", form.email) !== normalizeFieldValue("email", profile.email) ||
    normalizeFieldValue("gender", form.gender) !== normalizeFieldValue("gender", profile.gender) ||
    normalizeFieldValue("avatar", form.avatar) !== normalizeFieldValue("avatar", profile.avatar);

  const normalizedGender = normalizeFieldValue("gender", form.gender);
  const genderOptions =
    normalizedGender && !BASE_GENDER_OPTIONS.includes(normalizedGender)
      ? [normalizedGender, ...BASE_GENDER_OPTIONS]
      : BASE_GENDER_OPTIONS;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving || !hasChanges) {
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const result = await updateCurrentUserProfile({
      name: form.name,
      email: form.email,
      gender: form.gender,
      avatar: form.avatar,
    });

    if (!result.ok) {
      setError(result.error.messages[0] ?? "Update failed.");
      setIsSaving(false);
      return;
    }

    const mergedProfile = result.data
      ? { ...form, ...result.data }
      : {
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          gender: form.gender.trim().toUpperCase(),
          avatar: form.avatar.trim(),
        };

    setProfile(mergedProfile);
    setForm(mergedProfile);
    setSuccess("Profile updated successfully.");
    setIsSaving(false);
  };

  return (
    <ProfileShell>
      {isLoading ? (
        <main className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-12 sm:px-6">
          <ProfileStatusCard message="Loading profile editor..." />
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
      ) : (
        <main className="relative mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-12 sm:px-6">
          <header className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Edit profile</h1>
            <Link
              className="ui-btn-ghost rounded-full px-4 py-2 text-xs font-semibold transition-colors"
              href="/profile"
            >
              Back to profile
            </Link>
          </header>

          <form className="ui-card space-y-4 rounded-lg p-6" onSubmit={onSubmit}>
            <div>
              <label className="ui-text-muted block text-xs font-semibold uppercase tracking-widest-xl">
                Avatar URL
              </label>
              <input
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, avatar: event.target.value }))
                }
                placeholder="https://example.com/avatar.png"
                type="text"
                value={form.avatar}
              />
            </div>

            <div>
              <label className="ui-text-muted block text-xs font-semibold uppercase tracking-widest-xl">
                Full name
              </label>
              <input
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Your name"
                type="text"
                value={form.name}
              />
            </div>

            <div>
              <label className="ui-text-muted block text-xs font-semibold uppercase tracking-widest-xl">
                Email
              </label>
              <input
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@example.com"
                type="email"
                value={form.email}
              />
            </div>

            <div>
              <label className="ui-text-muted block text-xs font-semibold uppercase tracking-widest-xl">
                Gender
              </label>
              <select
                className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, gender: event.target.value }))
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
            </div>

            {error ? (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-xl border border-success/35 bg-success/10 px-3 py-2 text-sm text-success">
                {success}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                disabled={isSaving || !hasChanges}
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
