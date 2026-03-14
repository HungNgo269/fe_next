"use client";

import Image from "next/image";
import { useModalPostDataContext } from "./ModalPostContentContext";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v", ".avi"];

const isVideoUrl = (url: string) =>
  VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));

export default function ModalPostLeftPane() {
  const { post } = useModalPostDataContext();
  const { mediaUrls } = post;

  if (mediaUrls && mediaUrls.length > 0) {
    const firstMediaUrl = mediaUrls[0];
    return (
      <div className="post-detail-left">
        {isVideoUrl(firstMediaUrl) ? (
          <video className="post-detail-media" controls src={firstMediaUrl} />
        ) : (
          <Image
            className="post-detail-media"
            src={firstMediaUrl}
            alt="Post media"
            width={1280}
            height={1280}
            sizes="100vw"
            unoptimized
          />
        )}
      </div>
    );
  }

  return <></>;
}
