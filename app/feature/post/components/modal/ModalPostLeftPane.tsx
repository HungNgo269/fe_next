"use client";

import { useModalPostContentContext } from "./ModalPostContentContext";

export default function ModalPostLeftPane() {
  const { post } = useModalPostContentContext();
  const { content, mediaUrls } = post;

  if (mediaUrls && mediaUrls.length > 0) {
    return (
      <div className="post-detail-left">
        <img className="post-detail-media" src={mediaUrls[0]} alt="Post media" />
      </div>
    );
  }

  return (
    <div className="post-detail-left">
      <div className="post-detail-text-content">
        <p className="text-lg leading-7 text-foreground">{content}</p>
      </div>
    </div>
  );
}



