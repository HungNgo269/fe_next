type AvatarProps = {
  initials: string;
  colorClass: string;
  online?: boolean;
};

export default function Avatar({ initials, colorClass, online }: AvatarProps) {
  return (
    <div className="relative">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white ${colorClass}`}
      >
        {initials}
      </div>
      {online ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
      ) : null}
    </div>
  );
}
