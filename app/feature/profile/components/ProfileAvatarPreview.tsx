type ProfileAvatarPreviewProps = {
  avatarUrl: string;
  name: string;
  fallbackInitials: string;
};

export default function ProfileAvatarPreview({
  avatarUrl,
  name,
  fallbackInitials,
}: ProfileAvatarPreviewProps) {
  return (
    <div
      className={`profile-avatar-frame flex h-24 w-24 items-center justify-center rounded-md text-lg font-semibold text-white ${
        avatarUrl ? "profile-avatar-surface" : "bg-brand"
      }`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name ? `${name} avatar` : "User avatar"}
          className="profile-avatar-image"
          src={avatarUrl}
        />
      ) : (
        fallbackInitials
      )}
    </div>
  );
}
