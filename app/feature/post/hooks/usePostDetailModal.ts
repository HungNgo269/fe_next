"use client";

import { create } from "zustand";
import type { Post } from "../types/api.types";

type PostDetailModalState = {
  selectedPost: Post | null;
  openModal: (post: Post) => void;
  closeModal: () => void;
};

export const usePostDetailModal = create<PostDetailModalState>((set) => ({
  selectedPost: null,
  openModal: (post) => set({ selectedPost: post }),
  closeModal: () => set({ selectedPost: null }),
}));
