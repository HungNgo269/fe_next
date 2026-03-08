"use client";

import { useRouter } from "next/navigation";
import ModalPostContent from "./ModalPostContent";
import type { Post } from "../types/api.types";

export default function PostPermalinkView({ post }: { post: Post }) {
  const router = useRouter();

  return <ModalPostContent post={post} onClose={() => router.push("/")} />;
}
