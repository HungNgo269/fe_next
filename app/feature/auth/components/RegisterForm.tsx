"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormAlert from "@/app/share/components/FormAlert";
import {
  registerAction,
  requestRegisterCodeAction,
} from "../actions/auth.actions";
import { registerSchema, type RegisterFormValues } from "../schema/authSchema";

const buildErrorTitle = (status?: number) => {
  if (status === 400) {
    return "Invalid sign-up details";
  }
  if (status === 403) {
    return "Verification failed";
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
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);
  const [successTitle, setSuccessTitle] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<"details" | "code">("details");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [pendingValues, setPendingValues] = useState<RegisterFormValues | null>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
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

  useEffect(() => {
    if (resendCooldownSeconds <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setResendCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [resendCooldownSeconds]);

  const onSubmit = async (values: RegisterFormValues) => {
    setServerErrors([]);
    setErrorTitle(undefined);
    setSuccessTitle(undefined);
    setIsRequestingCode(true);

    const result = await requestRegisterCodeAction({ email: values.email });

    setIsRequestingCode(false);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    setPendingValues(values);
    setVerificationToken(result.data.verificationToken);
    setVerificationEmail(values.email);
    setVerificationCode("");
    setStep("code");
    setResendCooldownSeconds(60);
    setSuccessTitle(`Verification code sent to ${values.email}`);
  };

  const handleVerifyAndRegister = async () => {
    if (!pendingValues) {
      setStep("details");
      return;
    }

    setServerErrors([]);
    setErrorTitle(undefined);
    setSuccessTitle(undefined);
    setIsRegistering(true);

    const result = await registerAction({
      ...pendingValues,
      emailVerificationCode: verificationCode.trim(),
      emailVerificationToken: verificationToken,
    });

    setIsRegistering(false);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    router.replace("/login?registered=1");
    router.refresh();
  };

  const handleResendCode = async () => {
    if (!pendingValues) {
      setStep("details");
      return;
    }

    setServerErrors([]);
    setErrorTitle(undefined);
    setSuccessTitle(undefined);
    setIsRequestingCode(true);

    const result = await requestRegisterCodeAction({
      email: pendingValues.email,
    });

    setIsRequestingCode(false);
    if (!result.ok) {
      setServerErrors(result.error.messages);
      setErrorTitle(buildErrorTitle(result.error.status));
      return;
    }

    setVerificationToken(result.data.verificationToken);
    setVerificationCode("");
    setResendCooldownSeconds(60);
    setSuccessTitle(`A new verification code was sent to ${pendingValues.email}`);
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
        <p className="text-xs font-semibold uppercase -xl text-foreground-muted">
          Sign up
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Create a new account
        </h2>
        <p className="text-sm text-foreground-muted">
          {step === "details"
            ? "Fill in your details, then verify your email before the account is created."
            : "Enter the code sent to your email to finish creating the account."}
        </p>
      </div>

      <FormAlert title={errorTitle} messages={serverErrors} variant="error" />
      <FormAlert
        title={successTitle}
        messages={successTitle ? [successTitle] : []}
        variant="success"
      />

      {step === "details" ? (
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
              <p
                className="text-xs font-medium text-destructive"
                id={genderErrorId}
              >
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
            <p
              className="text-xs font-medium text-destructive"
              id={passwordErrorId}
            >
              {errors.password.message}
            </p>
          ) : null}

          <button
            className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting || isRequestingCode}
          >
            {isSubmitting || isRequestingCode
              ? "Sending verification code..."
              : "Continue"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-auth-field px-4 py-4 text-sm text-foreground">
            <p className="font-semibold">Verify your email</p>
            <p className="mt-1 text-foreground-muted">
              We sent a 6-digit code to {verificationEmail}.
            </p>
          </div>

          <input
            className={`${fieldClass} border-border text-center text-base tracking-[0.35em]`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={verificationCode}
            onChange={(event) =>
              setVerificationCode(
                event.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
          />

          <button
            className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-lg transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={verificationCode.trim().length !== 6 || isRegistering}
            onClick={handleVerifyAndRegister}
          >
            {isRegistering ? "Creating account..." : "Verify code and create account"}
          </button>

          <button
            className="flex w-full items-center justify-center rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isRequestingCode || resendCooldownSeconds > 0}
            onClick={handleResendCode}
          >
            {isRequestingCode
              ? "Sending a new code..."
              : resendCooldownSeconds > 0
                ? `Resend code (${resendCooldownSeconds}s)`
                : "Resend code"}
          </button>

          <button
            className="w-full text-sm font-medium text-link hover:underline"
            type="button"
            onClick={() => {
              setStep("details");
              setSuccessTitle(undefined);
              setServerErrors([]);
              setErrorTitle(undefined);
            }}
          >
            Back to edit sign-up details
          </button>
        </div>
      )}

      <p className="text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link className="font-semibold text-link hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
