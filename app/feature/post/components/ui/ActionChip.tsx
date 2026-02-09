import type { ReactNode } from "react";

type ActionChipProps = {
  label: string;
  icon: ReactNode;
};

export default function ActionChip({ label, icon }: ActionChipProps) {
  return (
    <button
      className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
      type="button"
    >
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}
