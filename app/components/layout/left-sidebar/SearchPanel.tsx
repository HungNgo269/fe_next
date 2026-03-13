"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, FileText, Loader2, Search, X } from "lucide-react";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import { formatRelativeTime } from "@/app/share/utils/format";
import {
  searchUsersAndPosts,
  type SidebarSearchAllResult,
} from "@/app/share/api/searchApi";
import { useSearchHistoryStore } from "@/app/share/stores/searchHistoryStore";

type SearchPanelProps = {
  open: boolean;
  onBack?: () => void;
  onResultSelect?: () => void;
};

const SEARCH_DEBOUNCE_MS = 450;
const SEARCH_MIN_QUERY_LENGTH = 1;

const createEmptySearchResults = (): SidebarSearchAllResult => ({
  users: [],
  posts: [],
  totalUsers: 0,
  totalPosts: 0,
  tookMs: 0,
});

const toProfileSlug = (user: {
  id: string;
  handle: string | null;
  username: string | null;
}) => user.handle?.trim() || user.username?.trim() || user.id;

export default function SearchPanel({
  open,
  onBack,
  onResultSelect,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SidebarSearchAllResult>(
    createEmptySearchResults,
  );
  const history = useSearchHistoryStore((state) => state.history);
  const pushToHistory = useSearchHistoryStore((state) => state.pushToHistory);
  const removeHistoryItem = useSearchHistoryStore(
    (state) => state.removeHistoryItem,
  );
  const clearHistory = useSearchHistoryStore((state) => state.clearHistory);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef(0);
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const lastFetchedQueryRef = useRef("");
  const trimmedQuery = query.trim();

  const clearInFlightRequest = useCallback(() => {
    activeRequestControllerRef.current?.abort();
    activeRequestControllerRef.current = null;
  }, []);

  const resetSearchState = useCallback(() => {
    setResults(createEmptySearchResults());
    setLoading(false);
  }, []);

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue);
    clearInFlightRequest();
    if (nextValue.trim().length < SEARCH_MIN_QUERY_LENGTH) {
      lastFetchedQueryRef.current = "";
      resetSearchState();
    }
  };

  const clearQuery = () => {
    setQuery("");
    lastFetchedQueryRef.current = "";
    clearInFlightRequest();
    resetSearchState();
  };

  useEffect(() => {
    if (!open) {
      clearInFlightRequest();
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [clearInFlightRequest, open]);

  useEffect(
    () => () => {
      clearInFlightRequest();
    },
    [clearInFlightRequest],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!trimmedQuery || trimmedQuery.length < SEARCH_MIN_QUERY_LENGTH) {
      clearInFlightRequest();
      return;
    }

    if (trimmedQuery === lastFetchedQueryRef.current) {
      return;
    }

    const timerId = window.setTimeout(() => {
      clearInFlightRequest();
      const controller = new AbortController();
      activeRequestControllerRef.current = controller;
      const requestId = ++requestIdRef.current;

      setLoading(true);
      void searchUsersAndPosts(trimmedQuery, { signal: controller.signal })
        .then((nextResults) => {
          if (requestId !== requestIdRef.current || controller.signal.aborted) {
            return;
          }
          setResults(nextResults);
          lastFetchedQueryRef.current = trimmedQuery;
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [clearInFlightRequest, open, trimmedQuery]);

  const hasResults = results.users.length > 0 || results.posts.length > 0;

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
            Tìm kiếm
          </h3>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Tìm kiếm người dùng, bài viết."
            className="h-11 w-full rounded-xl border border-border/70 bg-surface-hover/60 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-brand/60"
          />
          {query ? (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="h-[calc(100vh-125px)] overflow-y-auto px-2.5 py-2.5 sm:px-3 sm:py-3">
        {trimmedQuery ? (
          <section className="space-y-3">
            <h4 className="px-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              Kết quả tìm kiếm
            </h4>

            {trimmedQuery.length < SEARCH_MIN_QUERY_LENGTH ? (
              <div className="rounded-xl border border-border/60 px-3 py-6 text-center text-xs text-foreground-muted">
                Nhập tối thiểu {SEARCH_MIN_QUERY_LENGTH} ký tự để tìm kiếm
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
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Người dùng
                    </h5>
                    <span className="text-xs text-foreground-muted">
                      {results.totalUsers}
                    </span>
                  </div>

                  {results.users.length > 0 ? (
                    results.users.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${toProfileSlug(user)}`}
                        onClick={() => {
                          pushToHistory({
                            id: user.id,
                            name: user.name,
                            handle: user.handle,
                            username: user.username,
                          });
                          onResultSelect?.();
                        }}
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
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                      Bài viết
                    </h5>
                    <span className="text-xs text-foreground-muted">
                      {results.totalPosts}
                    </span>
                  </div>

                  {results.posts.length > 0 ? (
                    results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        onClick={() => onResultSelect?.()}
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
                            {post.authorId
                              ? `User ${post.authorId}`
                              : "Unknown author"}
                            {post.createdAt
                              ? ` | ${formatRelativeTime(post.createdAt)}`
                              : ""}
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
        ) : (
          <section className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                Mới đây
              </h4>
              {history.length > 0 ? (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs font-semibold text-brand transition hover:opacity-80"
                >
                  Xóa tất cả
                </button>
              ) : null}
            </div>

            {history.length > 0 ? (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition hover:bg-surface-hover"
                >
                  <Link
                    href={`/profile/${toProfileSlug(item)}`}
                    onClick={() => {
                      pushToHistory(item);
                      onResultSelect?.();
                    }}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <Avatar />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-foreground-muted">
                        @{item.handle || item.username || item.id}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeHistoryItem(item.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted transition hover:bg-background hover:text-foreground"
                    aria-label="Remove from history"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <></>
            )}
          </section>
        )}
      </div>
    </div>
  );
}


