"use client";

import { useCallback } from "react";
import { usePostDetailModal } from "../hooks/usePostDetailModal";
import type { Post } from "../types/api.types";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";

export default function PostCard({ post }: { post: Post }) {
  const openModal = usePostDetailModal((s) => s.openModal);
  const interactionPostId = post.sourcePostId ?? post.id;
  const openDetail = useCallback(() => {
    openModal(post, { syncUrl: true });
  }, [openModal, post]);

  return (
    <article className="rounded-md p-5">
      <PostHeader
        postId={interactionPostId}
        author={post.author}
        time={post.createdAt}
        audience="Public"
        sharedBy={post.sharedBy}
      />

      <PostBody
        postId={interactionPostId}
        content={post.content}
        mediaUrls={post.mediaUrls}
        onClickContent={openDetail}
      />

      <PostActions
        postId={interactionPostId}
        likedByMe={post.likedByMe}
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        sharesCount={post.sharesCount}
        onClickComment={openDetail}
      />
    </article>
  );
}
