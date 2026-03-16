import Link from "next/link";
import Image from "next/image";
import {
  fetchStoryUsersServer,
  mapUsersToStories,
} from "@/app/feature/story/api/storyApi.server";

export default async function FeedStoriesServer({
  currentUserId,
}: {
  currentUserId?: string | null;
}) {
  const users = await fetchStoryUsersServer();
  const stories = mapUsersToStories(users, currentUserId);

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <div className="mt-4 flex min-w-0 gap-3 overflow-x-auto pb-2">
        {stories.map((story) => (
          <Link
            className="relative flex w-20 cursor-pointer flex-col justify-between text-center"
            key={story.id}
            href={`/profile/${story.author.handle || story.author.id}`}
          >
            <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full">
              <Image
                alt={story.author.name ?? "story avatar"}
                src={story.author.avatarUrl ?? ""}
                fill
                sizes="80px"
              />
            </div>
            <p className="max-w-20 truncate text-center text-xs text-foreground">
              {story.author.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

