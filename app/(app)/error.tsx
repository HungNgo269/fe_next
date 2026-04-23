"use client";

import { useEffect } from "react";
import AppErrorFallback from "@/app/share/components/AppErrorFallback";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError:app-segment]", error);
  }, [error]);

  return (
    <AppErrorFallback
      error={error}
      resetErrorBoundary={reset}
      variant="page"
      boundaryName="app-segment"
      title="This screen is temporarily unavailable"
      message="The app shell is still active, but this route failed to render. Retry the route without losing the rest of the session."
      actionHref="/"
      actionLabel="Back to feed"
    />
  );
}
