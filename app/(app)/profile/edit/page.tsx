import EditProfilePageClient from "./EditProfilePageClient";
import { getCurrentUserProfileServer } from "@/app/feature/profile/api/profileApi.server";

const PROFILE_LOAD_ERROR = "Sorry we can't upload your profile right now";

export default async function EditProfilePage() {
  const result = await getCurrentUserProfileServer();

  return (
    <EditProfilePageClient
      initialProfile={result.ok ? result.data : null}
      isUnauthorized={
        !result.ok &&
        (result.error.status === 401 || result.error.status === 403)
      }
      loadError={result.ok ? "" : PROFILE_LOAD_ERROR}
    />
  );
}
