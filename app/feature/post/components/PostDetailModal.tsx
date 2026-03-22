"use client";

import { usePostDetailModal } from "../hooks/usePostDetailModal";
import ModalPostContent from "./ModalPostContent";

export default function PostDetailModal() {
  const selectedPost = usePostDetailModal((s) => s.selectedPost);
  const closeModal = usePostDetailModal((s) => s.closeModal);

  if (!selectedPost) return null;
  const modalKey = `${selectedPost.id}:${selectedPost.sourcePostId ?? ""}`;
  return (
    <ModalPostContent key={modalKey} post={selectedPost} onClose={closeModal} />
  );
}
