"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";
import {
  getAvatarFallbackColor,
  getInitialsFromLastTwoWords,
} from "@/app/share/utils/avatarFallback";
import { firstNonEmpty, normalizeNullableText } from "@/app/share/utils/helper";

type AvatarProps = {
  initials?: string;
  avatar?: string;
  online?: boolean;
};

export default function Avatar({ avatar, online, initials }: AvatarProps) {
  const currentUserName = useAppSessionStore(
    (state) => state.authProfile?.name ?? "",
  );
  const normalizedAvatar = normalizeNullableText(avatar);
  const hasAvatar = Boolean(normalizedAvatar);
  const isExternalAvatar = Boolean(
    normalizedAvatar && /^https?:\/\//i.test(normalizedAvatar),
  );
  const fallbackName = firstNonEmpty(initials, currentUserName) ?? "";
  const fallbackInitials = useMemo(
    () => getInitialsFromLastTwoWords(fallbackName),
    [fallbackName],
  );
  const fallbackColor = useMemo(
    () => getAvatarFallbackColor(fallbackName),
    [fallbackName],
  );

  return (
    <div className="relative">
      <div
        className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full ${
          hasAvatar
            ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            : "text-white"
        }`}
        style={!hasAvatar ? { backgroundColor: fallbackColor } : undefined}
      >
        {hasAvatar ? (
          <Image
            src={normalizedAvatar!}
            alt="Avatar"
            width={40}
            height={40}
            className="h-full w-full object-cover"
            loader={isExternalAvatar ? ({ src }) => src : undefined}
            unoptimized={isExternalAvatar}
          />
        ) : (
          <span className="text-xs font-semibold tracking-wide text-white">
            {fallbackInitials}
          </span>
        )}
      </div>
      {online ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
      ) : null}
    </div>
  );
}
