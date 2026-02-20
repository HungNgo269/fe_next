import Link from "next/link";

type LoginRequiredDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function LoginRequiredDialog({
  open,
  onClose,
}: LoginRequiredDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="ui-card w-full max-w-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Sign in required
        </h2>
        <p className="ui-text-muted mt-2 text-sm">
          You can browse posts and profiles as a guest, but posting, liking,
          commenting, and editing require an account.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Link
            href="/login"
            className="ui-btn-primary rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            Go to login
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-ghost rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
