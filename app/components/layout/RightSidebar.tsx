import { useSuggestedUsersQuery } from "@/app/feature/suggestion/queries/useSuggestedUsersQuery";
import SuggestionList from "@/app/feature/suggestion/components/SuggestionList";

export default function RightSidebar() {
  const { suggestions } = useSuggestedUsersQuery();

  return (
    <aside className="col-span-12 space-y-6 lg:col-span-3">
      <SuggestionList suggestions={suggestions} />
    </aside>
  );
}
