"use client";

import { firstNonEmpty } from "@/app/share/utils/helper";
import type { SidebarSearchUser } from "@/app/share/api/searchApi";
import type { SearchHistoryItem } from "@/app/share/stores/searchHistoryStore";
import SearchPanelHeader from "./search-panel/SearchPanelHeader";
import SearchPanelResults from "./search-panel/SearchPanelResults";
import SearchPanelHistory from "./search-panel/SearchPanelHistory";
import { useSidebarSearch } from "./hooks/useSidebarSearch";

type SearchPanelProps = {
  open: boolean;
  onBack?: () => void;
  onResultSelect?: () => void;
};

const toProfileSlug = (user: {
  id: string;
  handle: string | null;
  username: string | null;
}) => firstNonEmpty(user.handle, user.username) ?? user.id;

export default function SearchPanel({
  open,
  onBack,
  onResultSelect,
}: SearchPanelProps) {
  const search = useSidebarSearch(open);

  const handleUserSelect = (user: SidebarSearchUser) => {
    search.pushToHistory({
      id: user.id,
      name: user.name,
      handle: user.handle,
      username: user.username,
    });
    onResultSelect?.();
  };

  const handleHistorySelect = (item: SearchHistoryItem) => {
    search.pushToHistory(item);
    onResultSelect?.();
  };

  return (
    <div className="h-full w-full bg-background">
      <SearchPanelHeader
        onBack={onBack}
        inputRef={search.inputRef}
        query={search.query}
        onQueryChange={search.handleQueryChange}
        onClearQuery={search.clearQuery}
      />

      <div className="h-[calc(100vh-125px)] overflow-y-auto px-2.5 py-2.5 sm:px-3 sm:py-3">
        {search.trimmedQuery ? (
          <SearchPanelResults
            trimmedQuery={search.trimmedQuery}
            minQueryLength={search.minQueryLength}
            loading={search.loading}
            hasResults={search.hasResults}
            results={search.results}
            toProfileSlug={toProfileSlug}
            onUserSelect={handleUserSelect}
            onPostSelect={onResultSelect}
          />
        ) : (
          <SearchPanelHistory
            history={search.history}
            toProfileSlug={toProfileSlug}
            onSelectHistory={handleHistorySelect}
            onRemoveHistoryItem={search.removeHistoryItem}
            onClearHistory={search.clearHistory}
          />
        )}
      </div>
    </div>
  );
}
