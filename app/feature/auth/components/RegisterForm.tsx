"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import FormAlert from "@/app/share/components/FormAlert";
import { register as registerUser } from "../api/authApi";
import { registerSchema, type RegisterFormValues } from "../schema/authSchema";
import { useRouter } from "next/navigation";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

const buildErrorTitle = (status?: number) => {
  if (status === 400) {
    return "Invalid sign-up details";
  }
  if (status === 429) {
    return "Too many attempts. Please try again later.";
  }
  if (status && status >= 500) {
    return "Server error. Please try again later.";
  }
  return "Unable to sign up";
};

export default function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      gender: "MALE",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerErrors([]);
    setErrorTitle(undefined);

    const result = await registerUser(values);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    const authUser = result.data.user;
    setAuthenticatedProfile({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      gender: authUser.gender ?? "",
      avatar: authUser.avatarUrl ?? "",
    });
    await queryClient.invalidateQueries();
    router.replace("/");
  };

  const nameErrorId = errors.name ? "register-name-error" : undefined;
  const emailErrorId = errors.email ? "register-email-error" : undefined;
  const genderErrorId = errors.gender ? "register-gender-error" : undefined;
  const passwordErrorId = errors.password
    ? "register-password-error"
    : undefined;
  const fieldClass =
    "w-full rounded-xl border bg-auth-field px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-brand/70 focus:bg-auth-field-hover";

  return (
    <div className="mx-auto w-full max-w-md space-y-6 sm:max-w-lg lg:max-w-4xl">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest-xl text-foreground-muted">
          Sign up
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Create a new account
        </h2>
        <p className="text-sm text-foreground-muted">
          Fill in your details to get started.
        </p>
      </div>

      <FormAlert title={errorTitle} messages={serverErrors} variant="error" />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <input
          className={`${fieldClass} ${
            errors.name ? "border-destructive/60" : "border-border"
          }`}
          type="text"
          autoComplete="name"
          placeholder="Full name"
          required
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={nameErrorId}
          {...register("name")}
        />
        {errors.name?.message ? (
          <p className="text-xs font-medium text-destructive" id={nameErrorId}>
            {errors.name.message}
          </p>
        ) : null}

        <input
          className={`${fieldClass} ${
            errors.email ? "border-destructive/60" : "border-border"
          }`}
          type="email"
          autoComplete="email"
          placeholder="Email"
          required
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={emailErrorId}
          {...register("email")}
        />
        {errors.email?.message ? (
          <p className="text-xs font-medium text-destructive" id={emailErrorId}>
            {errors.email.message}
          </p>
        ) : null}

        <fieldset className="space-y-3 text-sm font-medium text-foreground">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-auth-field px-4 py-3 text-sm text-foreground shadow-sm transition hover:border-brand/50">
              Male
              <input
                type="radio"
                value="MALE"
                className="h-4 w-4 accent-brand"
                {...register("gender")}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-auth-field px-4 py-3 text-sm text-foreground shadow-sm transition hover:border-brand/50">
              Female
              <input
                type="radio"
                value="FEMALE"
                className="h-4 w-4 accent-brand"
                {...register("gender")}
              />
            </label>
          </div>
          {errors.gender?.message ? (
            <p className="text-xs font-medium text-destructive" id={genderErrorId}>
              {errors.gender.message}
            </p>
          ) : null}
        </fieldset>

        <input
          className={`${fieldClass} ${
            errors.password ? "border-destructive/60" : "border-border"
          }`}
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          required
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={passwordErrorId}
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-xs font-medium text-destructive" id={passwordErrorId}>
            {errors.password.message}
          </p>
        ) : null}

        <button
          className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-link hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
