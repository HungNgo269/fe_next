import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const highlights = [
  {
    title: "Real-time connections",
    description: "Follow friends, stay updated, and reply quickly.",
  },
  {
    title: "Layered security",
    description: "Secure sessions with tokens and HTTP-only cookies.",
  },
  {
    title: "Smooth experience",
    description: "Clean layout, fast load times, and mobile friendly.",
  },
];

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_40%,#fde68a_100%)] text-slate-900">
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl float-slow" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-15%] h-96 w-96 rounded-full bg-blue-200/40 blur-3xl float-slow" />

      <main className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              P
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Pulse</p>
              <p className="text-xs text-slate-500">Social studio</p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-lg text-base text-slate-600">{subtitle}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            Want to go back?{" "}
            <Link className="font-semibold text-slate-900" href="/">
              View the feed
            </Link>
          </p>
        </section>

        <section className="animate-fade-up rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[var(--shadow-soft)] backdrop-blur sm:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
