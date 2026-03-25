import SuggestionList from "@/app/feature/suggestion/components/SuggestionList";
import { fetchCurrentUserServer } from "@/app/feature/feed/api/feedApi.server";
import { fetchSuggestedUsersServer } from "@/app/feature/suggestion/api/suggestionUserApi.server";
import { userToSuggestion } from "@/app/feature/suggestion/types/suggestion.type";

export default async function FeedSuggestionsServer() {
  const currentUser = await fetchCurrentUserServer();
  const users = await fetchSuggestedUsersServer({
    excludeUserId: currentUser?.id ?? null,
    limit: 3,
  });
  const suggestions = users.map(userToSuggestion);

  return <SuggestionList suggestions={suggestions} />;
}

