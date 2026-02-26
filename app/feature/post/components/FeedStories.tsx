"use client";

import Link from "next/link";
import { useStories } from "../hooks/useStories";
import Avatar from "./ui/Avatar";

export default function FeedStories() {
  const { stories } = useStories();

  if (stories.length === 0) return null;

  return (
    <div className="ui-card min-w-0 rounded-lg p-5">
      <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-2">
        {stories.map((story) => (
          <Link
            className="relative flex min-w-story cursor-pointer flex-col justify-between rounded-2xl border border-border/40 bg-surface-elevated px-3 py-3 text-left shadow-sm transition-colors hover:bg-surface-hover"
            key={story.id}
            href={`/profile/${story.author.handle}`}
          >
            <div
              className={`mb-3 h-20 w-full rounded-2xl bg-gradient-to-br ${story.theme}`}
            />
            <div className="flex items-center gap-2">
              <Avatar
                avatar={story.author.avatarUrl ?? undefined} gender={story.author.gender}
              />
              <div>
                <p className="text-xs font-semibold text-foreground">{story.author.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
