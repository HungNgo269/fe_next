"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { User } from "../types/api.types";
import { formatRelativeTime } from "@/app/share/utils/format";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";
import { usePostActions } from "../hooks/usePostActions";
import { useClickOutside } from "@/app/share/hooks/useClickOutside";
import ReportReasonModal from "./ui/ReportReasonModal";

export default function PostHeader({
  postId,
  author,
  time,
  audience,
  sharedBy,
}: {
  postId: string;
  author: User;
  time: string;
  audience: string;
  sharedBy?: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}) {
  const {
    isOwner,
    handleStartEdit,
    handleDeletePost,
    isReportingPost,
    handleReportPost,
  } = usePostActions(postId);

  const fallback = author.email.split("@")[0] ?? "user";
  const userHandle = author.handle || fallback;
  const profileKey = author.handle || author.id;
  const displayTime = formatRelativeTime(time);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const menuRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setIsMenuOpen(false), []),
  );

  const handleReport = async () => {
    const trimmed = reportText.trim();
    const ok = await handleReportPost(trimmed ? trimmed : undefined);
    if (!ok) return;
    setIsReportOpen(false);
    setReportText("");
  };

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <Avatar
          avatar={sharedBy?.avatarUrl ?? author.avatarUrl ?? undefined}
          gender={author.gender}
        />
        <div>
          {sharedBy ? (
            <p className="ui-text-muted text-[11px] font-medium">
              <span className="text-foreground">{sharedBy.name}</span> shared
              this post
            </p>
          ) : null}
          <Link
            className="text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
            href={`/profile/${profileKey}`}
          >
            {author.name}
            <span className="ui-text-muted ml-2 text-xs font-medium">
              @{userHandle}
            </span>
          </Link>
          <p className="ui-text-muted text-xs">
            {displayTime} - {audience}
          </p>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          className="ui-text-muted rounded-full p-2 transition-opacity hover:opacity-70"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          type="button"
        >
          <IconMoreVertical />
        </button>
        {isMenuOpen ? (
          <div className=" absolute right-0 top-10 z-20 min-w-36 rounded-xl border border-border bg-surface p-2">
            {isOwner ? (
              <>
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleStartEdit();
                  }}
                  type="button"
                >
                  Edit post
                </button>
                <button
                  className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDeletePost();
                  }}
                  type="button"
                >
                  Delete post
                </button>
              </>
            ) : (
              <button
                className="block w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsReportOpen(true);
                }}
                type="button"
              >
                Report post
              </button>
            )}
          </div>
        ) : null}
      </div>
      <ReportReasonModal
        isSubmitting={isReportingPost}
        onChange={setReportText}
        onClose={() => {
          if (isReportingPost) return;
          setIsReportOpen(false);
          setReportText("");
        }}
        onSubmit={() => void handleReport()}
        open={isReportOpen}
        title="Report post"
        value={reportText}
      />
    </header>
  );
}
