"use client";

import { useEffect } from "react";
import AppErrorFallback from "./share/components/AppErrorFallback";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError:global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <AppErrorFallback
          error={error}
          resetErrorBoundary={reset}
          variant="page"
          boundaryName="global-root"
          title="The app failed to render"
          message="A global rendering error stopped this screen. Try again first before navigating away."
          actionHref="/"
          actionLabel="Back to home"
        />
      </body>
    </html>
  );
}
