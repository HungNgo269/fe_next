"use client";

import type { RefObject } from "react";
import { ChevronLeft, Search, X } from "lucide-react";

type SearchPanelHeaderProps = {
  onBack?: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
};

export default function SearchPanelHeader({
  onBack,
  inputRef,
  query,
  onQueryChange,
  onClearQuery,
}: SearchPanelHeaderProps) {
  return (
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
          Search
        </h3>
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search for people and posts."
          className="h-11 w-full rounded-xl border border-border/70 bg-surface-hover/60 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-brand/60"
        />
        {query ? (
          <button
            type="button"
            onClick={onClearQuery}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
            aria-label="Clear query"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
