"use client";

import {
  Check,
  Loader2,
  UserCheck,
  UserPlus,
  UserRoundPlus,
  X,
} from "lucide-react";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";
import type { FriendRequestUser } from "@/app/feature/profile/types/user-list.types";

type NotificationFriendSectionProps = {
  friendRequestLoading: boolean;
  incomingRequests: FriendRequestUser[];
  friendActivityNotifications: SidebarNotificationItem[];
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  isAccepting: (userId: string) => boolean;
  isDeclining: (userId: string) => boolean;
};

export default function NotificationFriendSection({
  friendRequestLoading,
  incomingRequests,
  friendActivityNotifications,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}: NotificationFriendSectionProps) {
  return (
    <section className="space-y-1.5 sm:space-y-2">
      <h4 className="px-1 text-xs font-semibold uppercase  text-foreground-muted">
        Kết bạn
      </h4>

      {friendRequestLoading ? <Loader2 /> : null}

      {!friendRequestLoading
        ? incomingRequests.map((request) => {
            const busy = isAccepting(request.id) || isDeclining(request.id);
            return (
              <div
                key={request.requestId}
                className="rounded-xl border border-border/60 bg-surface-hover/40 p-2.5 sm:rounded-2xl sm:p-3"
              >
                <div className="flex items-start gap-2.5">
                  <Avatar avatar={request.avatarUrl ?? undefined} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.handle ? `@${request.handle}` : request.name}
                    </p>
                    <p className="mt-0.5 text-sm leading-5 text-foreground-muted">
                      đã gửi lời mời kết bạn
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2 sm:mt-3">
                  <button
                    type="button"
                    onClick={() => onAccept(request.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
                  >
                    {isAccepting(request.id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    Xac nhan
                  </button>
                  <button
                    type="button"
                    onClick={() => onDecline(request.id)}
                    disabled={busy}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
                  >
                    {isDeclining(request.id) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Xóa yêu cầu
                  </button>
                </div>
              </div>
            );
          })
        : null}

      {!friendRequestLoading &&
      incomingRequests.length === 0 &&
      friendActivityNotifications.length === 0 ? (
        <div className="rounded-xl px-3 py-5 text-center text-xs text-foreground-muted sm:rounded-2xl sm:py-6">
          Chưa có thông báo kết bạn.
        </div>
      ) : null}

      {friendActivityNotifications.length > 0
        ? friendActivityNotifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/60 bg-surface-hover/40 p-2.5 sm:rounded-2xl sm:p-3"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 rounded-full bg-background p-1.5 text-foreground-muted">
                  {item.type === "NEW_FOLLOWER" ? (
                    <UserRoundPlus className="h-4 w-4" />
                  ) : item.type === "FRIEND_ACCEPTED" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-foreground-muted">
                    {item.time}
                  </p>
                </div>
              </div>
            </div>
          ))
        : null}
    </section>
  );
}
