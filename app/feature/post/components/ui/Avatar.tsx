import Image from "next/image";

type AvatarProps = {
  initials?: string;
  avatar?: string;
  gender?: string;
  online?: boolean;
};

export default function Avatar({ avatar, online, gender }: AvatarProps) {
  const normalizedAvatar = avatar?.trim();
  const hasAvatar = Boolean(normalizedAvatar);
  const isExternalAvatar = Boolean(normalizedAvatar && /^https?:\/\//i.test(normalizedAvatar));

  return (
    <div className="relative">
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
        {hasAvatar ? (
          <Image
            src={normalizedAvatar!}
            alt="Avatar"
            width={32}
            height={32}
            className="object-cover h-full w-full"
            loader={isExternalAvatar ? ({ src }) => src : undefined}
            unoptimized={isExternalAvatar}
          />
        ) : (
          <Image
            src={gender?.toUpperCase() === "FEMALE" ? "/avatars/female.svg" : "/avatars/male.svg"}
            alt="Default Avatar"
            width={32}
            height={32}
            className="object-cover h-full w-full opacity-60 dark:opacity-80"
          />
        )}
      </div>
      {online ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
      ) : null}
    </div>
  );
}
