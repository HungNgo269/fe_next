import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AvatarInfo } from "../types/feed";
import Avatar from "./ui/Avatar";
import { IconMoreVertical } from "@/app/share/components/icons";

type PostHeaderProps = {
  author: AvatarInfo & { id: string };
  time: string;
  audience: string;
  isPostOwner: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
  onReportPost: () => void;
};

export default function PostHeader({
  author,
  time,
  audience,
  isPostOwner,
  onStartEdit,
  onDelete,
  onReportPost,
}: PostHeaderProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <Avatar initials={author.initials} colorClass={author.colorClass} />
        <div>
          <Link
            className="text-sm font-semibold text-foreground transition-opacity hover:opacity-80"
            href={`/profile/${author.id}`}
          >
            {author.name}
            <span className="ui-text-muted ml-2 text-xs font-medium">
              @{author.handle}
            </span>
          </Link>
          <p className="ui-text-muted text-xs">
            {time} - {audience}
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
          <div className="ui-card absolute right-0 top-10 z-20 min-w-36 rounded-xl p-2">
            {isPostOwner ? (
              <>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => { setIsMenuOpen(false); onStartEdit(); }}
                  type="button"
                >
                  Edit post
                </button>
                <button
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                  onClick={() => { setIsMenuOpen(false); onDelete(); }}
                  type="button"
                >
                  Delete post
                </button>
              </>
            ) : (
              <button
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-foreground transition-opacity hover:opacity-70"
                onClick={() => { setIsMenuOpen(false); onReportPost(); }}
                type="button"
              >
                Report post
              </button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
