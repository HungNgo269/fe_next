import type { ReactNode } from "react";

type AppPageStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: "default" | "warning" | "error";
};

const TONE_STYLES: Record<NonNullable<AppPageStateProps["tone"]>, string> = {
  default: "border-border/70 bg-card/80 text-foreground",
  warning: "border-amber-500/30 bg-amber-500/10 text-foreground",
  error: "border-destructive/30 bg-destructive/10 text-foreground",
};

export default function AppPageState({
  title,
  message,
  action,
  secondaryAction,
  tone = "default",
}: AppPageStateProps) {
  return (
    <main className="relative mx-auto w-full max-w-4xl px-4 pb-16 pt-12 sm:px-6">
      <section
        className={`rounded-[2rem] border p-6 shadow-soft backdrop-blur sm:p-8 ${TONE_STYLES[tone]}`}
      >
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground-muted">
            Page status
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-6 text-foreground-muted">{message}</p>
        </div>

        {action || secondaryAction ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </section>
    </main>
  );
}
