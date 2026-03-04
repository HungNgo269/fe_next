"use client";

import {
  useModalPostDataContext,
  useModalPostEditContext,
} from "./ModalPostContentContext";

export default function ModalPostBody() {
  const { post } = useModalPostDataContext();
  const { isEditing, editingText, setEditingText, handleSaveEdit, handleCancelEdit } =
    useModalPostEditContext();

  return (
    <div className="post-detail-body">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            value={editingText}
            onChange={(event) => setEditingText(event.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              className="text-xs font-semibold text-foreground transition-opacity hover:opacity-70"
              onClick={handleSaveEdit}
              type="button"
            >
              Save changes
            </button>
            <button
              className="ui-text-muted text-xs font-semibold transition-opacity hover:opacity-70"
              onClick={handleCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="ui-text-muted text-sm leading-6">{post.content}</p>
      )}
    </div>
  );
}



