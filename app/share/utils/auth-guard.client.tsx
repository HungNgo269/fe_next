"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { refreshTokens } from "./api";

type AuthGuardOptions = {
  redirectTo?: string;
  enabled?: boolean;
};

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { redirectTo = "/login", enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    let active = true;

    const verify = async () => {
      try {
        await refreshTokens();
      } catch {
        if (active) {
          router.replace(redirectTo);
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    };

    verify();
    return () => {
      active = false;
    };
  }, [enabled, redirectTo, router]);

  return { isChecking };
};

type AuthGuardProps = {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  enabled?: boolean;
};

export const AuthGuard = ({
  children,
  fallback = null,
  redirectTo,
  enabled,
}: AuthGuardProps) => {
  const { isChecking } = useAuthGuard({ redirectTo, enabled });

  if (isChecking) {
    return fallback;
  }

  return <>{children}</>;
};
