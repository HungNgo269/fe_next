"use client";

import { type ReactNode } from "react";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import type { UserListType } from "../types/user-list.types";
import { normalizeNullableText, normalizeText } from "@/app/share/utils/helper";

interface ProfileHeaderProps {
  avatarUrl: string;
  initials?: string;
  name: string;
  handle?: string | null;
  bio?: string | null;
  headerActions?: ReactNode;
  postsCount: number;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  onOpenList: (type: UserListType) => void;
  profileError?: string;
  children?: ReactNode;
}

export default function ProfileHeader({
  avatarUrl,
  name,
  handle,
  bio,
  headerActions,
  postsCount,
  friendsCount,
  followersCount,
  followingCount,
  onOpenList,
  profileError,
  children,
}: ProfileHeaderProps) {
  const normalizedHandle = normalizeNullableText(handle);
  const normalizedName = normalizeText(name, "Unnamed user");
  const normalizedBio = normalizeText(bio);
  return (
    <section className="rounded-md p-6 sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-6">
          <ProfileAvatarPreview avatarUrl={avatarUrl} name={name} size="lg" />
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-xl font-bold text-foreground">
                {normalizedHandle || normalizedName}
              </h1>
              {headerActions ? (
                <div className="flex items-center gap-2">{headerActions}</div>
              ) : null}
            </div>
            {normalizedHandle ? (
              <p className="ui-text-muted text-sm font-medium">{name}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-4 text-sm sm:gap-6">
              <span>
                <span className="font-semibold text-foreground">
                  {postsCount}
                </span>{" "}
                posts
              </span>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("friends")}
              >
                <span className="font-semibold text-foreground">
                  {friendsCount}
                </span>{" "}
                friends
              </button>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("followers")}
              >
                <span className="font-semibold text-foreground">
                  {followersCount}
                </span>{" "}
                followers
              </button>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("following")}
              >
                following{" "}
                <span className="font-semibold text-foreground">
                  {followingCount}
                </span>{" "}
                users
              </button>
            </div>
            {normalizedBio ? (
              <p className="ui-text-muted whitespace-pre-line text-sm">
                {normalizedBio}
              </p>
            ) : null}
            {children ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {children}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {profileError ? (
        <p className="ui-alert-warning mt-4 rounded-2xl px-4 py-3 text-sm">
          {profileError}
        </p>
      ) : null}
    </section>
  );
}
