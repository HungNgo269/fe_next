"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";
import { cn } from "@/lib/utils";
import AppPageState from "./AppPageState";

type AppErrorFallbackProps = Partial<FallbackProps> & {
  title: string;
  message: string;
  variant?: "page" | "section" | "panel";
  boundaryName?: string;
  retryLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  className?: string;
};

function ActionLink({
  href,
  label,
  tone = "ghost",
}: {
  href: string;
  label: string;
  tone?: "primary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
        tone === "primary" ? "ui-btn-primary" : "ui-btn-ghost",
      )}
    >
      {label}
    </Link>
  );
}

export default function AppErrorFallback({
  error,
  resetErrorBoundary,
  title,
  message,
  variant = "section",
  boundaryName,
  retryLabel = "Try again",
  actionHref,
  actionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  className,
}: AppErrorFallbackProps) {
  useEffect(() => {
    console.error(`[ErrorBoundary:${boundaryName ?? title}]`, error);
  }, [boundaryName, error, title]);

  const retryAction = resetErrorBoundary ? (
    <button
      type="button"
      onClick={resetErrorBoundary}
      className="ui-btn-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
    >
      {retryLabel}
    </button>
  ) : null;

  const primaryAction =
    retryAction ??
    (actionHref && actionLabel ? (
      <ActionLink href={actionHref} label={actionLabel} tone="primary" />
    ) : undefined);

  const secondaryAction =
    actionHref && actionLabel && retryAction ? (
      <ActionLink href={actionHref} label={actionLabel} />
    ) : secondaryActionHref && secondaryActionLabel ? (
      <ActionLink href={secondaryActionHref} label={secondaryActionLabel} />
    ) : undefined;

  if (variant === "page") {
    return (
      <AppPageState
        title={title}
        message={message}
        action={primaryAction}
        secondaryAction={secondaryAction}
        tone="error"
      />
    );
  }

  return (
    <section
      role="alert"
      className={cn(
        "rounded-[1.75rem] border border-destructive/30 bg-destructive/10 p-5 text-foreground shadow-soft",
        variant === "panel" && "h-full rounded-none border-0 shadow-none",
        className,
      )}
    >
      <div className="max-w-xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground-muted">
          Section unavailable
        </p>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-foreground-muted">{message}</p>
      </div>

      {primaryAction || secondaryAction ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
}
