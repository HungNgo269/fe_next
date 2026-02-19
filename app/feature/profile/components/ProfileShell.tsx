import type { ReactNode } from "react";

type ProfileShellProps = {
  children: ReactNode;
};

export default function ProfileShell({ children }: ProfileShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}
