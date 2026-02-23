"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { useAppSessionStore } from "../stores/appSessionStore";

function ThemePreferenceSync() {
  const themePreference = useAppSessionStore((state) => state.themePreference);
  const setThemePreference = useAppSessionStore(
    (state) => state.setThemePreference,
  );
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== themePreference) {
      setTheme(themePreference);
    }
  }, [setTheme, theme, themePreference]);

  useEffect(() => {
    if ((theme === "light" || theme === "dark") && theme !== themePreference) {
      setThemePreference(theme);
    }
  }, [setThemePreference, theme, themePreference]);

  return null;
}

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  const themePreference = useAppSessionStore((state) => state.themePreference);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={themePreference}
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemePreferenceSync />
      {children}
    </ThemeProvider>
  );
}
