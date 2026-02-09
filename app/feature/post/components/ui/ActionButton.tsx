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
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
