import type { Suggestion } from "../types/suggestion.type";
import SuggestionCard from "./SuggestionCard";

export default function SuggestionList({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  return (
    <div className=" rounded-md p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Suggested for you
          </p>
          <p className="ui-text-muted text-xs">Follow creators in your niche</p>
        </div>
        <button
          className="ui-btn-ghost rounded-full px-3 py-1 text-xs font-semibold transition-colors "
          type="button"
        >
          See all
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {suggestions.map((person) => (
          <SuggestionCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}
