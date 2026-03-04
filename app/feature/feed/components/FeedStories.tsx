"use client";

import Link from "next/link";
import { useStories } from "@/app/feature/story/hooks/useStories";
import Image from "next/image";

export default function FeedStories() {
  const { stories } = useStories();

  if (stories.length === 0) return null;

  return (
    <div className=" min-w-0 ">
      <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-2">
        {stories.map((story) => (
          <Link
            className="relative flex w-20 cursor-pointer flex-col justify-between  text-center "
            key={story.id}
            href={`/profile/${story.author.handle || story.author.id}`}
          >
            <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full">
              <Image
                alt={story.author.name ?? "storiy's avatar"}
                src={story.author.avatarUrl ?? ""}
                fill
                sizes="80px"
              ></Image>
            </div>
            <p className="text-xs text-foreground text-center  truncate max-w-20">
              {story.author.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
