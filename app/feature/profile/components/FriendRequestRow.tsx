"use client";

import { Loader2, UserCheck, UserX, X } from "lucide-react";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import type { FriendRequestUser } from "../types/user-list.types";

interface FriendRequestRowProps {
  user: FriendRequestUser;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  isAccepting: boolean;
  isDeclining: boolean;
  isCancelling: boolean;
}

export default function FriendRequestRow({
  user,
  onAccept,
  onDecline,
  onCancel,
  isAccepting,
  isDeclining,
  isCancelling,
}: FriendRequestRowProps) {
  const busy = isAccepting || isDeclining || isCancelling;

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <ProfileAvatarPreview
          avatarUrl={user.avatarUrl ?? ""}
          name={user.name}
          size="md"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-sm">
          {user.handle || user.name}
        </span>
        {user.handle && (
          <span className="truncate text-xs text-muted-foreground">
            {user.name}
          </span>
        )}
      </div>

      {user.direction === "incoming" ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {isAccepting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserCheck className="h-3 w-3" />
            )}
            Accept
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDecline}
            className="flex items-center gap-1 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold hover:bg-muted/80 transition disabled:opacity-60"
          >
            {isDeclining ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserX className="h-3 w-3" />
            )}
            Decline
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-semibold hover:bg-muted/80 transition disabled:opacity-60"
        >
          {isCancelling ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Cancel
        </button>
      )}
    </div>
  );
}
