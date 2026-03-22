"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  searchUsersAndPosts,
  type SidebarSearchAllResult,
} from "@/app/share/api/searchApi";
import { useSearchHistoryStore } from "@/app/share/stores/searchHistoryStore";
import { normalizeText } from "@/app/share/utils/helper";

const SEARCH_DEBOUNCE_MS = 450;
const SEARCH_MIN_QUERY_LENGTH = 1;

const createEmptySearchResults = (): SidebarSearchAllResult => ({
  users: [],
  posts: [],
  totalUsers: 0,
  totalPosts: 0,
  tookMs: 0,
});

export function useSidebarSearch(open: boolean) {
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
  const trimmedQuery = normalizeText(query);

  const clearInFlightRequest = useCallback(() => {
    activeRequestControllerRef.current?.abort();
    activeRequestControllerRef.current = null;
  }, []);

  const resetSearchState = useCallback(() => {
    setResults(createEmptySearchResults());
    setLoading(false);
  }, []);

  const handleQueryChange = useCallback((nextValue: string) => {
    setQuery(nextValue);
    clearInFlightRequest();
    if (normalizeText(nextValue).length < SEARCH_MIN_QUERY_LENGTH) {
      lastFetchedQueryRef.current = "";
      resetSearchState();
    }
  }, [clearInFlightRequest, resetSearchState]);

  const clearQuery = useCallback(() => {
    setQuery("");
    lastFetchedQueryRef.current = "";
    clearInFlightRequest();
    resetSearchState();
  }, [clearInFlightRequest, resetSearchState]);

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
      void (async () => {
        try {
          const nextResults = await searchUsersAndPosts(trimmedQuery, {
            signal: controller.signal,
          });
          if (requestId !== requestIdRef.current || controller.signal.aborted) {
            return;
          }
          setResults(nextResults);
          lastFetchedQueryRef.current = trimmedQuery;
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [clearInFlightRequest, open, trimmedQuery]);

  const hasResults = results.users.length > 0 || results.posts.length > 0;

  return {
    query,
    trimmedQuery,
    loading,
    results,
    hasResults,
    inputRef,
    history,
    pushToHistory,
    removeHistoryItem,
    clearHistory,
    handleQueryChange,
    clearQuery,
    minQueryLength: SEARCH_MIN_QUERY_LENGTH,
  };
}

