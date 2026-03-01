import Link from "next/link";

export default function LoginRequiredDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className=" w-full max-w-md rounded-md p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-foreground">
          Sign in required
        </h2>
        <p className="ui-text-muted mt-2 text-sm">
          Please sign in to use sidebar actions, share content, post, like,
          comment, and edit.
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
