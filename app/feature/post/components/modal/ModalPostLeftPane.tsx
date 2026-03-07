"use client";

import { useModalPostDataContext } from "./ModalPostContentContext";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".avi"];

const isVideoUrl = (url: string) =>
  VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));

export default function ModalPostLeftPane() {
  const { post } = useModalPostDataContext();
  const { content, mediaUrls } = post;

  if (mediaUrls && mediaUrls.length > 0) {
    const firstMediaUrl = mediaUrls[0];
    return (
      <div className="post-detail-left">
        {isVideoUrl(firstMediaUrl) ? (
          <video className="post-detail-media" controls src={firstMediaUrl} />
        ) : (
          <img className="post-detail-media" src={firstMediaUrl} alt="Post media" />
        )}
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


