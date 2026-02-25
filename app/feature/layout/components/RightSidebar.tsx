import Link from "next/link";
import type { Suggestion } from "@/app/feature/post/types/feed";
import Avatar from "@/app/feature/post/components/ui/Avatar";

export default function RightSidebar({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <aside className="col-span-12 space-y-6 lg:col-span-3">
      <div className="ui-card rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Suggested for you</p>
            <p className="ui-text-muted text-xs">Follow creators in your niche</p>
          </div>
          <button
            className="ui-btn-ghost rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            type="button"
          >
            See all
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {suggestions.map((person) => (
            <div
              className="ui-subtle flex items-center justify-between gap-3 rounded-2xl px-3 py-3"
              key={person.id}
            >
              <Link
                className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
                href={`/profile/${person.id}`}
              >
                <Avatar
                  initials={person.initials}
                  colorClass={person.colorClass}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{person.name}</p>
                  <p className="ui-text-muted text-xs">{person.note}</p>
                </div>
              </Link>
              <button
                className="ui-btn-ghost rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                type="button"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
