import type { ReactNode } from "react";

type ProfileStatusCardProps = {
  message: string;
  title?: string;
  variant?: "default" | "error";
  action?: ReactNode;
};

const VARIANT_STYLES: Record<NonNullable<ProfileStatusCardProps["variant"]>, string> =
  {
    default: "border-slate-200/70 bg-white/90 text-slate-700",
    error: "border-rose-200/70 bg-rose-50/80 text-rose-700",
  };

export default function ProfileStatusCard({
  message,
  title,
  variant = "default",
  action,
}: ProfileStatusCardProps) {
  return (
    <div className={`rounded-3xl border p-8 text-sm shadow-soft ${VARIANT_STYLES[variant]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <p className={title ? "mt-1" : "font-medium"}>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
