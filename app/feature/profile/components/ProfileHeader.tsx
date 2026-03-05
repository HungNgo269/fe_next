"use client";

import { type ReactNode } from "react";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import type { UserListType } from "../types/user-list.types";

interface ProfileHeaderProps {
  avatarUrl: string;
  initials: string;
  name: string;
  handle?: string | null;
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
  initials,
  name,
  handle,
  headerActions,
  postsCount,
  friendsCount,
  followersCount,
  followingCount,
  onOpenList,
  profileError,
  children,
}: ProfileHeaderProps) {
  return (
    <section className="rounded-md p-6 sm:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 sm:h-32 sm:w-32">
            <ProfileAvatarPreview
              avatarUrl={avatarUrl}
              fallbackInitials={initials}
              name={name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-xl font-bold text-foreground">
                {handle || name || "Unnamed user"}
              </h1>
              {headerActions ? (
                <div className="flex items-center gap-2">{headerActions}</div>
              ) : null}
            </div>
            {handle ? (
              <p className="ui-text-muted text-sm font-medium">{name}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-4 text-sm sm:gap-6">
              <span>
                <span className="font-semibold text-foreground">{postsCount}</span>{" "}
                posts
              </span>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("friends")}
              >
                <span className="font-semibold text-foreground">{friendsCount}</span>{" "}
                friends
              </button>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("followers")}
              >
                <span className="font-semibold text-foreground">{followersCount}</span>{" "}
                followers
              </button>
              <button
                type="button"
                className="hover:text-brand transition-colors"
                onClick={() => onOpenList("following")}
              >
                following{" "}
                <span className="font-semibold text-foreground">{followingCount}</span>{" "}
                users
              </button>
            </div>
            {children ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>
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
