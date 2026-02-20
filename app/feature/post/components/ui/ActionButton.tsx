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
      className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70 ${
        active ? "text-like" : "ui-text-muted"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
