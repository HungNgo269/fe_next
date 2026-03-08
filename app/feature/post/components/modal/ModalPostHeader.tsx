"use client";

import Link from "next/link";
import { useState } from "react";
import Avatar from "../ui/Avatar";
import { formatRelativeTime } from "@/app/share/utils/format";
import {
  useModalPostDataContext,
  useModalPostEditContext,
  useModalPostActionsContext,
} from "./ModalPostContentContext";
import ReportReasonModal from "../ui/ReportReasonModal";

export default function ModalPostHeader() {
  const { post, profileKey, userHandle, isOwner } = useModalPostDataContext();
  const { handleStartEdit } = useModalPostEditContext();
  const { onClose, handleDeletePostAndClose, handleReportPost, isReportingPost } =
    useModalPostActionsContext();
  const author = post.author;
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const onReportPost = async () => {
    const trimmed = reportText.trim();
    const ok = await handleReportPost(trimmed ? trimmed : undefined);
    if (!ok) return;
    setIsReportOpen(false);
    setReportText("");
  };

  return (
    <div className="post-detail-header">
      <div className="flex items-center gap-3">
        <Avatar
          avatar={post.sharedBy?.avatarUrl ?? author.avatarUrl ?? undefined}
          gender={author.gender}
        />
        <div>
          {post.sharedBy ? (
            <p className="ui-text-muted text-[11px] font-medium">
              <span className="text-foreground">{post.sharedBy.name}</span>{" "}
              shared this post
            </p>
          ) : null}
          <Link
            className="text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
            href={`/profile/${profileKey}`}
            onClick={onClose}
          >
            {author.name}
            <span className="ui-text-muted ml-2 text-xs font-medium">
              @{userHandle}
            </span>
          </Link>
          <p className="ui-text-muted text-xs">
            {formatRelativeTime(post.createdAt)}
          </p>
        </div>
      </div>

      {isOwner ? (
        <div className="flex items-center gap-1">
          <button
            className="ui-text-muted rounded-full p-1.5 text-xs transition-opacity hover:opacity-70"
            onClick={handleStartEdit}
            type="button"
          >
            Edit
          </button>
          <button
            className="rounded-full p-1.5 text-xs text-destructive transition-opacity hover:opacity-70"
            onClick={handleDeletePostAndClose}
            type="button"
          >
            Delete
          </button>
        </div>
      ) : (
        <button
          className="rounded-full p-1.5 text-xs text-foreground transition-opacity hover:opacity-70"
          onClick={() => setIsReportOpen(true)}
          type="button"
        >
          Report
        </button>
      )}
      <ReportReasonModal
        isSubmitting={isReportingPost}
        onChange={setReportText}
        onClose={() => {
          if (isReportingPost) return;
          setIsReportOpen(false);
          setReportText("");
        }}
        onSubmit={() => void onReportPost()}
        open={isReportOpen}
        title="Report post"
        value={reportText}
      />
    </div>
  );
}
