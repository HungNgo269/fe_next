"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { useAppSessionStore } from "../stores/appSessionStore";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={themePreference}
        enableSystem={false}
        disableTransitionOnChange
      >
        <ThemePreferenceSync />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
