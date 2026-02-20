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
    <div className="ui-card rounded-lg p-5">
      <div className="flex items-start gap-4">
        <Avatar
          initials={currentUser.initials}
          colorClass={currentUser.colorClass}
        />
        <div className="flex-1">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            placeholder="Share something with your circle..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="ui-text-muted flex flex-wrap items-center gap-2 text-xs">
          <ActionChip label="Live video" icon={<IconVideo />} />
          <ActionChip label="Photo" icon={<IconImage />} />
          <ActionChip label="Feeling" icon={<IconSmile />} />
        </div>
        <div className="flex items-center gap-3">
          <span className="ui-text-soft text-xs">{value.length}/240</span>
          <button
            className="rounded-full px-2 py-1 text-sm font-semibold text-foreground transition-opacity hover:opacity-70 disabled:opacity-40"
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
