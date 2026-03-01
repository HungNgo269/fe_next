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
      className=" rounded-md p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="ui-text-muted block text-xs font-semibold uppercase tracking-widest-xl">
        {label}
      </label>
      {children}
      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="mt-2 text-xs font-medium text-success">
          {successMessage}
        </p>
      ) : null}
      <button
        className="ui-btn-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold transition-colors"
        disabled={disabled}
        type="submit"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
