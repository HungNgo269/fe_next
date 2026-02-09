import type { AvatarInfo } from "../types/feed";
import ActionChip from "./ui/ActionChip";
import Avatar from "./ui/Avatar";
import { IconImage, IconSmile, IconVideo } from "./icons";

type FeedComposerProps = {
  currentUser: AvatarInfo;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function FeedComposer({
  currentUser,
  value,
  onChange,
  onSubmit,
}: FeedComposerProps) {
  const canPost = value.trim().length > 0;

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[var(--shadow-soft)] animate-fade-up">
      <div className="flex items-start gap-4">
        <Avatar
          initials={currentUser.initials}
          colorClass={currentUser.colorClass}
        />
        <div className="flex-1">
          <textarea
            className="min-h-[90px] w-full resize-none rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-slate-400"
            placeholder="Share something with your circle..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <ActionChip label="Live video" icon={<IconVideo />} />
          <ActionChip label="Photo" icon={<IconImage />} />
          <ActionChip label="Feeling" icon={<IconSmile />} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{value.length}/240</span>
          <button
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canPost}
            onClick={onSubmit}
            type="button"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
