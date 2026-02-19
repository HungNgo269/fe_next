import type { ReactNode } from "react";

type ActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
};

export default function ActionButton({
  label,
  icon,
  onClick,
  active,
}: ActionButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
        active
          ? "ui-btn-primary"
          : "ui-subtle ui-text-muted hover:bg-surface-hover"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
