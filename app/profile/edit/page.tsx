"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../../feature/profile/api/profileApi";
import ProfileShell from "../../feature/profile/components/ProfileShell";
import ProfileStatusCard from "../../feature/profile/components/ProfileStatusCard";
import type { UserProfile } from "../../feature/profile/types/profile";
import { useAppSessionStore } from "../../share/stores/appSessionStore";
import { Loader2 } from "lucide-react";
import type { ApiError } from "../../share/utils/api-types";
import { toast } from "sonner";

const BASE_GENDER_OPTIONS = ["MALE", "FEMALE"];

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
  bio: "",
};

const normalizeFieldValue = (
  field: keyof UserProfile,
  value: string,
): string => {
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

  if ((form.bio ?? "").trim().length > 500) {
    return "Bio must be 500 characters or fewer.";
  }

  return null;
};

const formatFriendlyError = (
  error: ApiError | undefined,
  fallback: string,
): string => {
  const firstMessage = error?.messages?.[0]?.trim() ?? "";
  if (!firstMessage) return fallback;

  if (/^Cannot\s+(GET|POST|PATCH|PUT|DELETE)\s+/i.test(firstMessage)) {
    return "A server route is not available yet. Please try again after backend restart.";
  }

  if (error?.status === 401 || error?.status === 403) {
    return "Your session expired. Please sign in again.";
  }

  return firstMessage;
};

export default function EditProfilePage() {
  const router = useRouter();
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const [profile, setProfile] = useState<UserProfile>(() =>
    authProfile
      ? {
          id: authProfile.id,
          name: authProfile.name,
          email: authProfile.email,
          gender: authProfile.gender,
          avatar: authProfile.avatar,
          bio: authProfile.bio ?? "",
        }
      : EMPTY_PROFILE,
  );
  const [form, setForm] = useState<UserProfile>(() =>
    authProfile
      ? {
          id: authProfile.id,
          name: authProfile.name,
          email: authProfile.email,
          gender: authProfile.gender,
          avatar: authProfile.avatar,
          bio: authProfile.bio ?? "",
        }
      : EMPTY_PROFILE,
  );
  const [isLoading, setIsLoading] = useState(!authProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [error, setError] = useState("");

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
        setForm(nextProfile);
        setIsUnauthorized(false);
        setError("");
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
        setError(result.error.messages[0] ?? "Unable to load profile.");
        setIsLoading(false);
        return;
      }

      setProfile(result.data);
      setForm(result.data);
      if (result.data.id) {
        setAuthenticatedProfile({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          gender: result.data.gender,
          avatar: result.data.avatar,
          bio: result.data.bio ?? "",
        });
      }
      setIsUnauthorized(false);
      setError("");
      setIsLoading(false);
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [authProfile, setAuthenticatedProfile]);

  const hasChanges =
    normalizeFieldValue("name", form.name) !==
      normalizeFieldValue("name", profile.name) ||
    normalizeFieldValue("email", form.email) !==
      normalizeFieldValue("email", profile.email) ||
    normalizeFieldValue("gender", form.gender) !==
      normalizeFieldValue("gender", profile.gender) ||
    normalizeFieldValue("avatar", form.avatar) !==
      normalizeFieldValue("avatar", profile.avatar) ||
    normalizeFieldValue("bio", form.bio ?? "") !==
      normalizeFieldValue("bio", profile.bio ?? "");

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
      return;
    }

    setIsSaving(true);
    setError("");

    const result = await updateCurrentUserProfile({
      name: form.name,
      email: form.email,
      gender: form.gender,
      avatar: form.avatar,
      bio: form.bio ?? "",
    });

    if (!result.ok) {
      setError(formatFriendlyError(result.error, "Update failed."));
      setIsSaving(false);
      return;
    }

    const mergedProfile: UserProfile = { ...form, ...result.data };

    setProfile(mergedProfile);
    setForm(mergedProfile);
    const nextProfileId = mergedProfile.id ?? profile.id ?? authProfile?.id;
    if (nextProfileId) {
      setAuthenticatedProfile({
        id: nextProfileId,
        name: mergedProfile.name,
        email: mergedProfile.email,
        gender: mergedProfile.gender,
        avatar: mergedProfile.avatar,
        bio: mergedProfile.bio,
      });
    }
    toast.success("Profile updated");
    setIsSaving(false);
    router.push("/profile");
  };

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
      ) : (
        <main className="relative mx-auto w-full max-w-3xl space-y-4 px-4 pb-16 pt-12 sm:px-6">
          <header className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Edit profile
            </h1>
          </header>

          <form className=" space-y-4 rounded-md p-6" onSubmit={onSubmit}>
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
                Bio
              </label>
              <textarea
                className="ui-input mt-2 min-h-24 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
                maxLength={500}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bio: event.target.value }))
                }
                placeholder="Tell people about yourself..."
                value={form.bio ?? ""}
              />
              <p className="ui-text-muted mt-1 text-xs">
                {(form.bio ?? "").trim().length}/500
              </p>
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
                readOnly
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
              <p className="text-base text-red-600">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className="ui-btn-ghost rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                disabled={isSaving || !(form.bio ?? "").trim()}
                onClick={() => setForm((prev) => ({ ...prev, bio: "" }))}
                type="button"
              >
                Clear bio
              </button>
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
