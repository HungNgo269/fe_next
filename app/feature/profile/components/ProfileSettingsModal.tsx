"use client";

import * as Dialog from "@radix-ui/react-dialog";

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  loggingOut?: boolean;
};

export default function ProfileSettingsModal({
  open,
  onClose,
  onLogout,
  loggingOut = false,
}: ProfileSettingsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/70 bg-background shadow-soft">
          <Dialog.Title className="sr-only">Profile settings</Dialog.Title>
          <div className="divide-y divide-border/60">
            <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-surface-hover"
            >
              Ung dung va trang web
            </button>
            <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-surface-hover"
            >
              Thong bao
            </button>
            <button
              type="button"
              className="w-full px-4 py-3 text-center text-sm font-medium text-foreground transition hover:bg-surface-hover"
            >
              Cai dat va quyen rieng tu
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="w-full px-4 py-3 text-center text-sm font-semibold text-destructive transition hover:bg-surface-hover disabled:opacity-60"
            >
              {loggingOut ? "Dang dang xuat..." : "Dang xuat"}
            </button>
            <Dialog.Close className="w-full px-4 py-3 text-center text-sm font-medium text-foreground-muted transition hover:bg-surface-hover">
              Huy
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
