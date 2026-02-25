type PostMedia = {
  gradientClass: string;
  title: string;
  subtitle?: string;
};

type PostBodyProps = {
  content: string;
  media?: PostMedia;
  isEditing: boolean;
  editingText: string;
  onChangeEditingText: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

export default function PostBody({
  content,
  media,
  isEditing,
  editingText,
  onChangeEditingText,
  onSaveEdit,
  onCancelEdit,
}: PostBodyProps) {
  return (
    <div className="mt-4">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            value={editingText}
            onChange={(event) => onChangeEditingText(event.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
              onClick={onSaveEdit}
              type="button"
            >
              Save changes
            </button>
            <button
              className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
              onClick={onCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="ui-text-muted text-sm leading-6">{content}</p>
      )}

      {media ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <div
            className={`flex h-44 flex-col items-start justify-end bg-cover p-4 text-sm text-foreground ${media.gradientClass}`}
          >
            <p className="text-sm font-semibold">{media.title}</p>
            {media.subtitle ? (
              <p className="ui-text-muted text-xs">{media.subtitle}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
