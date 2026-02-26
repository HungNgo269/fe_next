import { useSuggestedUsers } from "@/app/feature/suggestion/hooks/useSuggestedUsers";
import SuggestionList from "@/app/feature/suggestion/components/SuggestionList";

export default function RightSidebar() {
  const { suggestions } = useSuggestedUsers();

  return (
    <aside className="col-span-12 space-y-6 lg:col-span-3">
      <SuggestionList suggestions={suggestions} />
    </aside>
  );
}
