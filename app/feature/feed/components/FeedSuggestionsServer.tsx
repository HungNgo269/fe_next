import SuggestionList from "@/app/feature/suggestion/components/SuggestionList";
import { fetchSuggestedUsersServer } from "@/app/feature/suggestion/api/suggestionUserApi.server";
import { userToSuggestion } from "@/app/feature/suggestion/types/suggestion.type";

export default async function FeedSuggestionsServer({
  currentUserId,
}: {
  currentUserId?: string | null;
}) {
  const users = await fetchSuggestedUsersServer({
    excludeUserId: currentUserId,
    limit: 3,
  });
  const suggestions = users.map(userToSuggestion);

  return <SuggestionList suggestions={suggestions} />;
}

