import type { ReactNode } from "react";

type ActionChipProps = {
  label: string;
  icon: ReactNode;
};

export default function ActionChip({ label, icon }: ActionChipProps) {
  return (
    <button
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ui-text-muted transition-opacity hover:opacity-70"
      type="button"
    >
      <span className="ui-text-muted">{icon}</span>
      {label}
    </button>
  );
}
