import type { ReactNode } from "react";
import AppShell from "../components/layout/AppShell";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";
import { UserProvider } from "@/app/share/providers/UserProvider";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const currentUser = await fetchCurrentUserServer();

  return (
    <UserProvider user={currentUser}>
      <AppShell>{children}</AppShell>
    </UserProvider>
  );
}
