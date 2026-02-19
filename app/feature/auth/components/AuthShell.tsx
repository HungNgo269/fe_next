import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-auth lg:items-center">
        {children}
      </main>
    </div>
  );
}
