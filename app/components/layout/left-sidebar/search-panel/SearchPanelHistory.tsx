"use client";

import Link from "next/link";
import { X } from "lucide-react";
import Avatar from "@/app/feature/post/components/ui/Avatar";
import type { SearchHistoryItem } from "@/app/share/stores/searchHistoryStore";

type SearchPanelHistoryProps = {
  history: SearchHistoryItem[];
  toProfileSlug: (item: SearchHistoryItem) => string;
  onSelectHistory: (item: SearchHistoryItem) => void;
  onRemoveHistoryItem: (itemId: string) => void;
  onClearHistory: () => void;
};

export default function SearchPanelHistory({
  history,
  toProfileSlug,
  onSelectHistory,
  onRemoveHistoryItem,
  onClearHistory,
}: SearchPanelHistoryProps) {
  return (
    <section className="space-y-1.5 sm:space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold uppercase  text-foreground-muted">
          Recent
        </h4>
        {history.length > 0 ? (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs font-semibold text-brand transition hover:opacity-80"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {history.length > 0
        ? history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition hover:bg-surface-hover"
            >
              <Link
                href={`/profile/${toProfileSlug(item)}`}
                onClick={() => onSelectHistory(item)}
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
                onClick={() => onRemoveHistoryItem(item.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground-muted transition hover:bg-background hover:text-foreground"
                aria-label="Remove from history"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        : null}
    </section>
  );
}
