"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AppErrorFallback from "./AppErrorFallback";

type AppErrorBoundaryProps = {
  children: ReactNode;
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
  resetKeys?: unknown[];
  onReset?: () => void;
};

export default function AppErrorBoundary({
  children,
  title,
  message,
  variant = "section",
  boundaryName,
  retryLabel,
  actionHref,
  actionLabel,
  secondaryActionHref,
  secondaryActionLabel,
  className,
  resetKeys,
  onReset,
}: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      resetKeys={resetKeys}
      onReset={onReset}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <AppErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={title}
          message={message}
          variant={variant}
          boundaryName={boundaryName}
          retryLabel={retryLabel}
          actionHref={actionHref}
          actionLabel={actionLabel}
          secondaryActionHref={secondaryActionHref}
          secondaryActionLabel={secondaryActionLabel}
          className={className}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
