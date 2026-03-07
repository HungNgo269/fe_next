import type { ReactNode } from "react";

type ActionButtonProps = {
  label?: string;
  icon: ReactNode;
  count?: number;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

export default function ActionButton({
  label,
  icon,
  count,
  onClick,
  active,
  disabled,
}: ActionButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70 ${
        active ? "text-like" : "ui-text-muted"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label ? <span>{label}</span> : null}
      {count !== undefined ? <span className="text-xs">{count}</span> : null}
    </button>
  );
}
