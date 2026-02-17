import type { ReactNode } from "react";

type ProfileFieldCardProps = {
  label: string;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  disabled: boolean;
  errorMessage?: string;
  successMessage?: string;
  children: ReactNode;
};

export default function ProfileFieldCard({
  label,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  disabled,
  errorMessage,
  successMessage,
  children,
}: ProfileFieldCardProps) {
  return (
    <form
      className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block text-xs font-semibold uppercase tracking-widest-xl text-slate-500">
        {label}
      </label>
      {children}
      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{errorMessage}</p>
      ) : null}
      {successMessage ? (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          {successMessage}
        </p>
      ) : null}
      <button
        className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
