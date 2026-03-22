"use client";

import { ChevronLeft } from "lucide-react";

type NotificationPanelHeaderProps = {
  onBack?: () => void;
};

export default function NotificationPanelHeader({ onBack }: NotificationPanelHeaderProps) {
  return (
    <div className="border-b border-border/60 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted transition hover:bg-surface-hover hover:text-foreground lg:hidden"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
        <h3 className="text-xl font-semibold leading-none text-foreground sm:text-2xl">
          Thong bao
        </h3>
      </div>
    </div>
  );
}
