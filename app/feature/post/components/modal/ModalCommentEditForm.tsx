"use client";

import { useModalCommentEditContext } from "./ModalCommentItemContext";

export default function ModalCommentEditForm() {
  const { editingText, setEditingText, saveEdit, cancelEdit } =
    useModalCommentEditContext();

  return (
    <div className="mt-1 space-y-2">
      <input
        className="ui-input w-full rounded-full px-3 py-1.5 text-xs outline-none transition-colors"
        value={editingText}
        onChange={(event) => setEditingText(event.target.value)}
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



