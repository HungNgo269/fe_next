"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Check,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  UserCheck,
  UserPlus,
  UserRoundPlus,
  X,
} from "lucide-react";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";
import { useFriendRequestActions } from "@/app/feature/profile/hooks/useFriendRequestActions";

type NotificationPanelProps = {
  notifications: SidebarNotificationItem[];
  loading: boolean;
  onBack?: () => void;
};

const POST_PAGE_SIZE = 10;
const FRIEND_TYPES = new Set<SidebarNotificationItem["type"]>([
  "FRIEND_REQUEST",
  "FRIEND_ACCEPTED",
  "NEW_FOLLOWER",
]);

export default function NotificationPanel({
  notifications,
  loading,
  onBack,
}: NotificationPanelProps) {
  const [visiblePostCount, setVisiblePostCount] = useState(POST_PAGE_SIZE);
  const {
    requests,
    isLoading: friendRequestLoading,
    accept,
    decline,
    isAccepting,
    isDeclining,
  } = useFriendRequestActions(true);

  const incomingRequests = useMemo(
    () => requests.filter((item) => item.direction === "incoming"),
    [requests],
  );

  const friendNotifications = useMemo(
    () => notifications.filter((item) => FRIEND_TYPES.has(item.type)),
    [notifications],
  );

  const friendActivityNotifications = useMemo(
    () => friendNotifications.filter((item) => item.type !== "FRIEND_REQUEST"),
    [friendNotifications],
  );

  const postNotifications = useMemo(
    () =>
      notifications.filter(
        (item) => item.type === "LIKE" || item.type === "COMMENT",
      ),
    [notifications],
  );

  const visiblePostNotifications = postNotifications.slice(0, visiblePostCount);

  if (loading) {
    return (
      <div className="h-full w-full bg-background">
        <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
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

      <div className="h-[calc(100vh-57px)] space-y-3 overflow-y-auto px-2.5 py-2.5 sm:space-y-5 sm:px-3 sm:py-3">
        <section className="space-y-1.5 sm:space-y-2">
          <h4 className="px-1 text-xs font-semibold uppercase  text-foreground-muted">
            Kết bạn
          </h4>

          {friendRequestLoading ? <Loader2></Loader2> : null}

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
                        onClick={() => accept(request.id)}
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
                        onClick={() => decline(request.id)}
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
            <div className="rounded-xl border border-border/60 px-3 py-5 text-center text-xs text-foreground-muted sm:rounded-2xl sm:py-6">
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

        <section className="space-y-1.5 sm:space-y-2">
          <h4 className="px-1 text-xs font-semibold uppercase  text-foreground-muted">
            Like và bình luận
          </h4>

          {postNotifications.length === 0 ? (
            <div className="rounded-xl border border-border/60 px-3 py-5 text-center text-xs text-foreground-muted sm:rounded-2xl sm:py-6">
              Chưa có thông báo bài đăng
            </div>
          ) : (
            <>
              {visiblePostNotifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/60 bg-surface-hover/40 p-2.5 sm:rounded-2xl sm:p-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 rounded-full p-1.5 ${
                        item.type === "LIKE"
                          ? "bg-like/10 text-like"
                          : "bg-background text-foreground-muted"
                      }`}
                    >
                      {item.type === "LIKE" ? (
                        <Heart className="h-4 w-4" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
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

                  <div className="mt-2.5 flex items-center justify-end sm:mt-3">
                    {item.referenceId ? (
                      <Link
                        href={`/posts/${item.referenceId}`}
                        className="inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-hover sm:px-3"
                      >
                        Xem bài đăng
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}

              {visiblePostCount < postNotifications.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisiblePostCount((prev) =>
                      Math.min(prev + POST_PAGE_SIZE, postNotifications.length),
                    )
                  }
                  className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Tải thêm thông báo
                </button>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

