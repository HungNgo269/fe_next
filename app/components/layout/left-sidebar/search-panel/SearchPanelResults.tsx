"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import type { SidebarSearchAllResult, SidebarSearchUser } from "@/app/share/api/searchApi";
import { formatRelativeTime } from "@/app/share/utils/format";

type SearchPanelResultsProps = {
  trimmedQuery: string;
  minQueryLength: number;
  loading: boolean;
  hasResults: boolean;
  results: SidebarSearchAllResult;
  toProfileSlug: (user: SidebarSearchUser) => string;
  onUserSelect: (user: SidebarSearchUser) => void;
  onPostSelect?: () => void;
};

export default function SearchPanelResults({
  trimmedQuery,
  minQueryLength,
  loading,
  hasResults,
  results,
  toProfileSlug,
  onUserSelect,
  onPostSelect,
}: SearchPanelResultsProps) {
  return (
    <section className="space-y-3">
      <h4 className="px-1 text-xs font-semibold uppercase  text-foreground-muted">
        Kết quả tìm kiếm
      </h4>

      {trimmedQuery.length < minQueryLength ? (
        <div className="rounded-xl border border-border/60 px-3 py-6 text-center text-xs text-foreground-muted">
          Nhập tối thiểu {minQueryLength} ký tự để tìm kiếm
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-xl border border-border/60 py-8 text-foreground-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !hasResults ? (
        <div className="rounded-xl border border-border/60 px-3 py-6 text-center text-xs text-foreground-muted">
          Không thấy kết quả
        </div>
      ) : (
        <>
          <section className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between px-1">
              <h5 className="text-xs font-semibold uppercase  text-foreground-muted">
                Người dùng
              </h5>
              <span className="text-xs text-foreground-muted">{results.totalUsers}</span>
            </div>

            {results.users.length > 0 ? (
              results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${toProfileSlug(user)}`}
                  onClick={() => onUserSelect(user)}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-surface-hover"
                >
                  <Avatar />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      @{user.handle || user.username || user.id}
                      {user.bio ? ` - ${user.bio}` : ""}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-border/60 px-3 py-4 text-center text-xs text-foreground-muted">
                Không có kết quả
              </div>
            )}
          </section>

          <section className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between px-1">
              <h5 className="text-xs font-semibold uppercase  text-foreground-muted">
                Bài viết
              </h5>
              <span className="text-xs text-foreground-muted">{results.totalPosts}</span>
            </div>

            {results.posts.length > 0 ? (
              results.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  onClick={() => onPostSelect?.()}
                  className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition hover:bg-surface-hover"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-foreground-muted">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {post.content}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {post.authorId ? `User ${post.authorId}` : "Unknown author"}
                      {post.createdAt ? ` | ${formatRelativeTime(post.createdAt)}` : ""}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-border/60 px-3 py-4 text-center text-xs text-foreground-muted">
                Không có kết quả
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
