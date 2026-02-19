import type { ReactNode } from "react";

type ActionChipProps = {
  label: string;
  icon: ReactNode;
};

export default function ActionChip({ label, icon }: ActionChipProps) {
  return (
    <button
      className="ui-btn-ghost flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-semibold transition-colors"
      type="button"
    >
      <span className="ui-text-muted">{icon}</span>
      {label}
    </button>
  );
}
