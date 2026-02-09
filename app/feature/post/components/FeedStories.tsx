import type { StoryData } from "../types/feed";
import Avatar from "./ui/Avatar";

type FeedStoriesProps = {
  stories: StoryData[];
};

export default function FeedStories({ stories }: FeedStoriesProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[var(--shadow-soft)] animate-fade-up animate-delay-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Stories</p>
          <p className="text-xs text-slate-500">
            Quick moments from your people
          </p>
        </div>
        <button
          className="rounded-full border border-slate-200/70 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          type="button"
        >
          Create story
        </button>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {stories.map((story) => (
          <button
            className="relative flex min-w-[150px] cursor-pointer flex-col justify-between rounded-2xl border border-transparent bg-white px-3 py-3 text-left shadow-sm transition-colors hover:border-slate-200/70 hover:bg-white/90"
            key={story.id}
            type="button"
          >
            <div
              className={`mb-3 h-20 w-full rounded-2xl bg-gradient-to-br ${story.theme}`}
            />
            <div className="flex items-center gap-2">
              <Avatar
                initials={story.author.initials}
                colorClass={story.author.colorClass}
              />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {story.author.name}
                </p>
                <p className="text-[11px] text-slate-500">{story.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
