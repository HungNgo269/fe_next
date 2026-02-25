import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CommentData } from "../types/feed";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";

type CommentItemProps = {
  comment: CommentData;
  isCommentOwner: boolean;
  onSaveCommentEdit: (commentId: string, content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onReportComment: () => void;
};

export default function CommentItem({
  comment,
  isCommentOwner,
  onSaveCommentEdit,
  onDeleteComment,
  onReportComment,
}: CommentItemProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEdit = () => {
    setEditingText(comment.text);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingText("");
  };

  const saveEdit = async () => {
    const ok = await onSaveCommentEdit(comment.id, editingText);
    if (ok) cancelEdit();
  };

  const handleDelete = async () => {
    const ok = await onDeleteComment(comment.id);
    if (ok) {
      setIsMenuOpen(false);
      if (isEditing) cancelEdit();
    }
  };

  return (
    <div className="ui-subtle group relative flex items-start gap-3 rounded-2xl px-3 py-2.5">
      <Avatar initials={comment.author.initials} colorClass={comment.author.colorClass} />

      <div className="flex-1">
        <Link
          className="text-xs font-semibold text-foreground transition-opacity hover:opacity-80"
          href={`/profile/${comment.author.id}`}
        >
          {comment.author.name}
          <span className="ui-text-muted ml-2 text-2xs font-normal">{comment.time}</span>
        </Link>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <input
              className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
              value={editingText}
              onChange={(event) => setEditingText(event.target.value)}
            />
            <div className="flex items-center gap-3">
              <button
                className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
                onClick={() => void saveEdit()}
                type="button"
              >
                Save
              </button>
              <button
                className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
                onClick={cancelEdit}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="ui-text-muted text-xs">{comment.text}</p>
        )}
      </div>

      <div className="relative ml-2 self-start" ref={menuRef}>
        <button
          className="ui-text-muted rounded-full p-1.5 opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-100 focus:opacity-100"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          type="button"
        >
          <IconMoreVertical />
        </button>
        {isMenuOpen ? (
          <div className="ui-card absolute right-0 top-8 z-20 min-w-36 rounded-xl p-2">
            {isCommentOwner ? (
              <>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={startEdit}
                  type="button"
                >
                  Edit comment
                </button>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => void handleDelete()}
                  type="button"
                >
                  Delete comment
                </button>
              </>
            ) : (
              <button
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                onClick={() => { setIsMenuOpen(false); onReportComment(); }}
                type="button"
              >
                Report comment
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
