"use client";

import { useCallback } from "react";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";

type ReportReasonModalProps = {
  open: boolean;
  title: string;
  value: string;
  isSubmitting?: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function ReportReasonModal({
  open,
  title,
  value,
  isSubmitting = false,
  onChange,
  onClose,
  onSubmit,
}: ReportReasonModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(
    useCallback(() => {
      if (isSubmitting) return;
      onClose();
    }, [isSubmitting, onClose]),
  );
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-lg"
        ref={modalRef}
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <textarea
          className="mt-3 min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Reason (optional)"
          value={value}
        />
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground/80 transition-opacity hover:opacity-70"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onSubmit}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}
