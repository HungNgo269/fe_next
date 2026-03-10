import Link from "next/link";
import type { Suggestion } from "../types/suggestion.type";
import Avatar from "@/app/feature/post/components/ui/Avatar";

export default function SuggestionCard({ person }: { person: Suggestion }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <Link
        className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
        href={`/profile/${person.handle || person.id}`}
      >
        <Avatar avatar={person.avatar} gender={person.gender} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{person.name}</p>
          <p className="ui-text-muted text-xs">{person.note}</p>
        </div>
      </Link>
      <button
        className="ui-btn-primary-nobg px-3 py-1 text-xs font-semibold transition-colors"
        type="button"
      >
        Follow
      </button>
    </div>
  );
}
