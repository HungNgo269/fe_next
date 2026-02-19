import type { Suggestion } from "../types/feed";
import Avatar from "./ui/Avatar";

type RightSidebarProps = {
  suggestions: Suggestion[];
};

export default function RightSidebar({ suggestions }: RightSidebarProps) {
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
              key={person.handle}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  initials={person.initials}
                  colorClass={person.colorClass}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{person.name}</p>
                  <p className="ui-text-muted text-xs">{person.note}</p>
                </div>
              </div>
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
