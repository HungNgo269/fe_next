"use client";

import Link from "next/link";
import { Heart, MessageCircle, Plus } from "lucide-react";
import type { SidebarNotificationItem } from "@/app/feature/feed/types/feed";

type NotificationPostSectionProps = {
  visiblePostCount: number;
  postNotifications: SidebarNotificationItem[];
  visiblePostNotifications: SidebarNotificationItem[];
  onLoadMore: () => void;
};

export default function NotificationPostSection({
  visiblePostCount,
  postNotifications,
  visiblePostNotifications,
  onLoadMore,
}: NotificationPostSectionProps) {
  return (
    <section className="space-y-1.5 sm:space-y-2">
      <h4 className="px-1 text-xs font-semibold uppercase  text-foreground-muted">
        Like và bình luận
      </h4>

      {postNotifications.length === 0 ? (
        <div className="rounded-xl px-3 py-5 text-center text-xs text-foreground-muted sm:rounded-2xl sm:py-6">
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
              onClick={onLoadMore}
              className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm font-semibold text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              Tải thêm thông báo
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
