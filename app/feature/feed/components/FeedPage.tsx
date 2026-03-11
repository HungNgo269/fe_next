import FeedPageClient from "./FeedPageClient";
import { fetchSuggestedUsersServer } from "@/app/feature/suggestion/api/suggestionUserApi.server";

export default async function FeedPage() {
  const suggestedUsers = await fetchSuggestedUsersServer();
  return <FeedPageClient initialSuggestedUsers={suggestedUsers} />;
}
