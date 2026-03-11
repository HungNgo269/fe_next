"use client";

import { useAutoResizeTextarea } from "@/app/share/hooks/useAutoResizeTextarea";
import {
  useModalPostDataContext,
  useModalPostEditContext,
} from "./ModalPostContentContext";

export default function ModalPostBody() {
  const { post } = useModalPostDataContext();
  const {
    isEditing,
    editingText,
    setEditingText,
    handleSaveEdit,
    handleCancelEdit,
  } = useModalPostEditContext();
  const editTextareaRef = useAutoResizeTextarea<HTMLTextAreaElement>(
    editingText,
    { minHeight: 96, maxHeight: 320 },
  );

  return post.content ? (
    <div>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="ui-input min-h-composer w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
            ref={editTextareaRef}
            rows={3}
            value={editingText}
            onChange={(event) => setEditingText(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                editingText.trim().length > 0
              ) {
                event.preventDefault();
                handleSaveEdit();
              }
            }}
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
        <p className="ui-text-muted whitespace-pre-line break-words px-3 py-0.5 text-base leading-6">
          {post.content}
        </p>
      )}
    </div>
  ) : (
    <div></div>
  );
}
