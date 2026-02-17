import type { ReactNode } from "react";

type ProfileShellProps = {
  children: ReactNode;
};

export default function ProfileShell({ children }: ProfileShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-radial-feed text-slate-900">
      <div className="pointer-events-none absolute -top-32 -right-10p h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl float-slow" />
      <div className="pointer-events-none absolute -bottom-15p -left-10p h-96 w-96 rounded-full bg-blue-200/40 blur-3xl float-slow" />
      {children}
    </div>
  );
}
