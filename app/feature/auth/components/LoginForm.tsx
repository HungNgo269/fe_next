"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/authApi";
import { loginSchema, type LoginFormValues } from "../schema/authSchema";
import FormAlert from "@/app/share/components/FormAlert";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

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
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
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

    const authUser = result.data.user;
    setAuthenticatedProfile({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      gender: authUser.gender ?? "",
      avatar: authUser.avatarUrl ?? "",
    });
    setSuccessMessage("Signed in successfully. Redirecting...");
    router.replace("/");
  };

  const emailErrorId = errors.email ? "login-email-error" : undefined;
  const passwordErrorId = errors.password ? "login-password-error" : undefined;
  const fieldClass =
    "w-full rounded-2xl border bg-auth-field px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-brand/70 focus:bg-auth-field-hover";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen w-full lg:grid-cols-3">
        <section className="relative hidden overflow-hidden lg:col-span-2 lg:block">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80"
            alt="People collaborating in a modern workspace"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-auth-hero-overlay" />
          <div className="absolute bottom-10 left-10 right-10 max-w-xl space-y-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest-xl text-white/75">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Join conversations, share moments, and stay connected.
            </h1>
            <p className="text-sm text-white/80">
              Sign in to continue your social experience with stronger contrast
              in both light and dark mode.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-lg rounded-lg border border-border bg-auth-panel p-7 shadow-soft backdrop-blur md:p-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest-xl text-foreground-muted">
                Sign in
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome back
              </h2>
              <p className="text-sm text-foreground-muted">
                Enter your credentials to continue.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <FormAlert
                title={errorTitle}
                messages={serverErrors}
                variant="error"
              />
              <FormAlert
                title="Success"
                messages={successMessage ? [successMessage] : []}
                variant="success"
              />
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <label className="block space-y-2 text-sm font-medium text-foreground">
                Email
                <input
                  className={`${fieldClass} ${
                    errors.email ? "border-destructive/60" : "border-border"
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
                    className="text-xs font-medium text-destructive"
                    id={emailErrorId}
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </label>

              <label className="block space-y-2 text-sm font-medium text-foreground">
                Password
                <input
                  className={`${fieldClass} ${
                    errors.password ? "border-destructive/60" : "border-border"
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
                    className="text-xs font-medium text-destructive"
                    id={passwordErrorId}
                  >
                    {errors.password.message}
                  </p>
                ) : null}
              </label>

              <button
                className="flex w-full items-center justify-center rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-foreground-muted">
              New here?{" "}
              <Link
                className="font-semibold text-link hover:underline"
                href="/register"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
