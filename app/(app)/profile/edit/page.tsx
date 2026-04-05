import EditProfilePageClient from "./EditProfilePageClient";
import { getCurrentUserProfileServer } from "@/app/feature/profile/api/profileApi.server";
import {
  OK_ACCESS_STATE,
  getAccessStateFromStatus,
} from "@/app/share/utils/access-state";

const PROFILE_LOAD_ERROR = "Sorry, we can't load your profile right now.";

export default async function EditProfilePage() {
  const result = await getCurrentUserProfileServer();
  const accessState = result.ok
    ? OK_ACCESS_STATE
    : getAccessStateFromStatus(result.error.status, PROFILE_LOAD_ERROR);

  return (
    <EditProfilePageClient
      initialProfile={result.ok ? result.data : null}
      accessState={accessState}
      loadError={result.ok || accessState.kind !== "error" ? "" : PROFILE_LOAD_ERROR}
    />
  );
}
