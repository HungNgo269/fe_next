"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormAlert from "@/app/share/components/FormAlert";
import { register as registerUser } from "../api/authApi";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schema/authSchema";

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
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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
    setSuccessMessage(null);

    const result = await registerUser(values);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    setSuccessMessage("Account created successfully. You can sign in now.");
    reset();
  };

  const nameErrorId = errors.name ? "register-name-error" : undefined;
  const emailErrorId = errors.email ? "register-email-error" : undefined;
  const genderErrorId = errors.gender ? "register-gender-error" : undefined;
  const passwordErrorId = errors.password ? "register-password-error" : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Sign up
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">
          Create a new account
        </h2>
        <p className="text-sm text-slate-600">
          Fill in your details to get started.
        </p>
      </div>

      <FormAlert title={errorTitle} messages={serverErrors} variant="error" />
      <FormAlert
        title="Success"
        messages={successMessage ? [successMessage] : []}
        variant="success"
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Full name
          <input
            className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 ${
              errors.name ? "border-rose-300" : "border-slate-200/70"
            }`}
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            required
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={nameErrorId}
            {...register("name")}
          />
          {errors.name?.message ? (
            <p
              className="text-xs font-medium text-rose-600"
              id={nameErrorId}
            >
              {errors.name.message}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Email
          <input
            className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 ${
              errors.email ? "border-rose-300" : "border-slate-200/70"
            }`}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={emailErrorId}
            {...register("email")}
          />
          {errors.email?.message ? (
            <p
              className="text-xs font-medium text-rose-600"
              id={emailErrorId}
            >
              {errors.email.message}
            </p>
          ) : null}
        </label>

        <fieldset className="space-y-3 text-sm font-medium text-slate-700">
          <legend className="text-sm font-medium text-slate-700">
            Gender
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
              Male
              <input
                type="radio"
                value="MALE"
                className="h-4 w-4 accent-slate-900"
                {...register("gender")}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
              Female
              <input
                type="radio"
                value="FEMALE"
                className="h-4 w-4 accent-slate-900"
                {...register("gender")}
              />
            </label>
          </div>
          {errors.gender?.message ? (
            <p
              className="text-xs font-medium text-rose-600"
              id={genderErrorId}
            >
              {errors.gender.message}
            </p>
          ) : null}
        </fieldset>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Password
          <input
            className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 ${
              errors.password ? "border-rose-300" : "border-slate-200/70"
            }`}
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={passwordErrorId}
            {...register("password")}
          />
          {errors.password?.message ? (
            <p
              className="text-xs font-medium text-rose-600"
              id={passwordErrorId}
            >
              {errors.password.message}
            </p>
          ) : null}
        </label>

        <button
          className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-slate-900" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
