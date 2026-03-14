import Image from "next/image";
import {
  getAvatarFallbackColor,
  getInitialsFromLastTwoWords,
} from "@/app/share/utils/avatarFallback";

type ProfileAvatarSize = "md" | "lg";

type ProfileAvatarPreviewProps = {
  avatarUrl: string;
  name: string;
  size?: ProfileAvatarSize;
};

const PROFILE_AVATAR_SIZE_CONFIG: Record<
  ProfileAvatarSize,
  { px: number; containerClass: string; textClass: string }
> = {
  md: {
    px: 40,
    containerClass: "h-10 w-10",
    textClass: "text-xs",
  },
  lg: {
    px: 150,
    containerClass: "h-[150px] w-[150px]",
    textClass: "text-2xl",
  },
};

export default function ProfileAvatarPreview({
  avatarUrl,
  name,
  size = "md",
}: ProfileAvatarPreviewProps) {
  const { px, containerClass, textClass } = PROFILE_AVATAR_SIZE_CONFIG[size];
  const fallbackInitials = getInitialsFromLastTwoWords(name);
  const fallbackColor = getAvatarFallbackColor(name);

  return (
    <div
      className={`profile-avatar-frame ${containerClass} ${textClass} flex items-center justify-center rounded-full font-semibold text-white ${
        avatarUrl ? "profile-avatar-surface" : ""
      }`}
      style={!avatarUrl ? { backgroundColor: fallbackColor } : undefined}
    >
      {avatarUrl ? (
        <Image
          alt={name ? `${name} avatar` : "User avatar"}
          className="profile-avatar-image"
          src={avatarUrl}
          width={px}
          height={px}
          unoptimized
        />
      ) : (
        fallbackInitials
      )}
    </div>
  );
}
