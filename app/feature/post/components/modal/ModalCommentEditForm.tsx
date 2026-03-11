"use client";

import { useAutoResizeTextarea } from "@/app/share/hooks/useAutoResizeTextarea";
import { useModalCommentEditContext } from "./ModalCommentItemContext";

export default function ModalCommentEditForm() {
  const { editingText, setEditingText, saveEdit, cancelEdit } =
    useModalCommentEditContext();
  const editTextareaRef = useAutoResizeTextarea<HTMLTextAreaElement>(editingText, {
    minHeight: 34,
    maxHeight: 180,
  });

  return (
    <div className="mt-1 space-y-2">
      <textarea
        className="ui-input w-full resize-none rounded-2xl border border-border/70 px-3 py-1.5 text-xs outline-none transition-colors"
        ref={editTextareaRef}
        rows={1}
        value={editingText}
        onChange={(event) => setEditingText(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            editingText.trim().length > 0
          ) {
            event.preventDefault();
            saveEdit();
          }
        }}
      />
      <div className="flex items-center gap-3">
        <button
          className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
          onClick={saveEdit}
          type="button"
        >
          Save
        </button>
        <button
          className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
          onClick={cancelEdit}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
