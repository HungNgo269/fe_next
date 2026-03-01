import type { ReactNode } from "react";

type ProfileStatusCardProps = {
  message: string;
  title?: string;
  variant?: "default" | "error";
  action?: ReactNode;
};

const VARIANT_STYLES: Record<
  NonNullable<ProfileStatusCardProps["variant"]>,
  string
> = {
  default: " text-foreground",
  error:
    "border border-destructive/35 bg-destructive/10 text-destructive shadow-soft",
};

export default function ProfileStatusCard({
  message,
  title,
  variant = "default",
  action,
}: ProfileStatusCardProps) {
  return (
    <div className={`rounded-md p-8 text-sm ${VARIANT_STYLES[variant]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <p className={title ? "mt-1" : "font-medium"}>{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
