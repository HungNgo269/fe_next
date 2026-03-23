"use client";

import ModalPostLeftPane from "./modal/ModalPostLeftPane";
import ModalPostHeader from "./modal/ModalPostHeader";
import ModalPostBody from "./modal/ModalPostBody";
import ModalPostComments from "./modal/ModalPostComments";
import ModalPostActions from "./modal/ModalPostActions";
import ModalPostComposer from "./modal/ModalPostComposer";
import { ModalPostContentProvider } from "./modal/ModalPostContentContext";
import type { Post } from "../types/api.types";
import { useModalPostContentController } from "../controllers/useModalPostContentController";

interface ModalPostContentProps {
  post: Post;
  onClose: () => void;
}

export default function ModalPostContent({ post, onClose }: ModalPostContentProps) {
  const { contentRef, providerValue } = useModalPostContentController({
    post,
    onClose,
  });

  return (
    <div className="post-detail-overlay">
      <div className="post-detail-container" ref={contentRef}>
        <ModalPostContentProvider value={providerValue}>
          <ModalPostLeftPane />
          <div className="post-detail-right">
            <ModalPostHeader />
            <ModalPostBody />
            <ModalPostComments />
            <ModalPostActions />
            <ModalPostComposer />
          </div>
        </ModalPostContentProvider>
      </div>
    </div>
  );
}

