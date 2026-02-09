"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/authApi";
import { loginSchema, type LoginFormValues } from "../schema/authSchema";
import FormAlert from "@/app/share/components/FormAlert";

const buildErrorTitle = (status?: number) => {
  if (status === 400) {
    return "Invalid sign-in details";
  }
  if (status === 401) {
    return "Incorrect email or password";
  }
  if (status === 429) {
    return "Too many attempts. Please try again later.";
  }
  if (status && status >= 500) {
    return "Server error. Please try again later.";
  }
  return "Unable to sign in";
};

export default function LoginForm() {
  const router = useRouter();
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerErrors([]);
    setErrorTitle(undefined);
    setSuccessMessage(null);

    const result = await login(values);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    setSuccessMessage("Signed in successfully. Redirecting...");
    router.replace("/");
  };

  const emailErrorId = errors.email ? "login-email-error" : undefined;
  const passwordErrorId = errors.password ? "login-password-error" : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Sign in
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-600">
          Enter your credentials to continue.
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
            <p className="text-xs font-medium text-rose-600" id={emailErrorId}>
              {errors.email.message}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Password
          <input
            className={`w-full rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 ${
              errors.password ? "border-rose-300" : "border-slate-200/70"
            }`}
            type="password"
            autoComplete="current-password"
            placeholder="********"
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link className="font-semibold text-slate-900" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
