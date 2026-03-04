"use client";

import { useCallback, useEffect } from "react";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";

export function useModalLifecycle(onClose: () => void) {
  const stableClose = useCallback(() => onClose(), [onClose]);
  const contentRef = useClickOutside<HTMLDivElement>(stableClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return { contentRef };
}
