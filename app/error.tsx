"use client";

import { useEffect } from "react";
import AppErrorFallback from "./share/components/AppErrorFallback";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError:root]", error);
  }, [error]);

  return (
    <AppErrorFallback
      error={error}
      resetErrorBoundary={reset}
      variant="page"
      boundaryName="root-route"
      title="Something went wrong"
      message="The page hit an unexpected error. You can retry without leaving the app."
      actionHref="/"
      actionLabel="Back to home"
    />
  );
}
