import type { Suggestion, TrendingTopic } from "../types/feed";
import Avatar from "./ui/Avatar";

type RightSidebarProps = {
  trendingTopics: TrendingTopic[];
  suggestions: Suggestion[];
};

export default function RightSidebar({
  trendingTopics,
  suggestions,
}: RightSidebarProps) {
  return (
    <aside className="col-span-12 space-y-6 lg:col-span-3">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Trending</p>
            <p className="text-xs text-slate-500">
              Conversations heating up
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            type="button"
          >
            Explore
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {trendingTopics.map((item) => (
            <div
              className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
              key={item.topic}
            >
              <p className="text-sm font-semibold text-slate-900">
                {item.topic}
              </p>
              <p className="text-xs text-slate-500">{item.posts}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Suggested for you
            </p>
            <p className="text-xs text-slate-500">
              Follow creators in your niche
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            type="button"
          >
            See all
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {suggestions.map((person) => (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3"
              key={person.handle}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  initials={person.initials}
                  colorClass={person.colorClass}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {person.name}
                  </p>
                  <p className="text-xs text-slate-500">{person.note}</p>
                </div>
              </div>
              <button
                className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                type="button"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft">
        <p className="text-sm font-semibold text-slate-900">Upcoming</p>
        <p className="mt-1 text-xs text-slate-500">
          Community events this week
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
            <p className="text-sm font-semibold text-slate-900">Creator sync</p>
            <p className="text-xs text-slate-500">Tomorrow · 4:00 PM</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
            <p className="text-sm font-semibold text-slate-900">Product jam</p>
            <p className="text-xs text-slate-500">Fri · 11:00 AM</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
