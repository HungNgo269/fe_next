"use client";

import { usePostDetailModal } from "../hooks/usePostDetailModal";
import ModalPostContent from "./ModalPostContent";

export const commentQueryKey = (postId: string) =>
  ["post-comments", postId] as const;

export default function PostDetailModal() {
  const selectedPost = usePostDetailModal((s) => s.selectedPost);
  const closeModal = usePostDetailModal((s) => s.closeModal);

  if (!selectedPost) return null;
  return <ModalPostContent post={selectedPost} onClose={closeModal} />;
}
