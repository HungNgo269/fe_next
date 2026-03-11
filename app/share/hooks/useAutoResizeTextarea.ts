"use client";

import { useLayoutEffect, useRef } from "react";

type UseAutoResizeTextareaOptions = {
  minHeight?: number;
  maxHeight?: number;
};

export function useAutoResizeTextarea<T extends HTMLTextAreaElement>(
  value: string,
  options?: UseAutoResizeTextareaOptions,
) {
  const ref = useRef<T | null>(null);
  const { minHeight = 0, maxHeight } = options ?? {};

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.height = "auto";
    const nextHeight = Math.max(minHeight, element.scrollHeight);

    if (typeof maxHeight === "number") {
      element.style.height = `${Math.min(nextHeight, maxHeight)}px`;
      element.style.overflowY =
        nextHeight > maxHeight ? "auto" : "hidden";
      return;
    }

    element.style.height = `${nextHeight}px`;
    element.style.overflowY = "hidden";
  }, [value, minHeight, maxHeight]);

  return ref;
}

