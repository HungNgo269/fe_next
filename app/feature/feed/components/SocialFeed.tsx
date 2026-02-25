"use client";

import LoginRequiredDialog from "@/app/share/components/LoginRequiredDialog";
import RightSidebar from "@/app/feature/layout/components/RightSidebar";
import { useSocialFeed } from "@/app/feature/post/hooks/useSocialFeed";
import FeedMainContent from "./FeedMainContent";

export default function SocialFeed() {
  const feed = useSocialFeed();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <main className="relative grid min-w-0 w-full grid-cols-12 gap-6 px-4 pb-24 pt-10 sm:px-6 lg:pb-16">
        <div className="lg:col-span-2"></div>
        <FeedMainContent
          isLoadingFeed={feed.isLoadingFeed}
          feedError={feed.feedError}
          stories={feed.stories}
          currentUser={feed.currentUser}
          composerText={feed.composerText}
          posts={feed.posts}
          editingPostId={feed.editingPostId}
          editingText={feed.editingText}
          commentDrafts={feed.commentDrafts}
          onComposerChange={feed.handleComposerChange}
          onCreatePost={feed.handleCreatePost}
          onStartEdit={feed.handleStartEdit}
          onCancelEdit={feed.handleCancelEdit}
          onSaveEdit={feed.handleSaveEdit}
          onDeletePost={feed.handleDeletePost}
          onChangeEditingText={feed.setEditingText}
          onToggleLike={feed.handleToggleLike}
          onShare={feed.handleShare}
          onChangeCommentDraft={feed.handleCommentDraft}
          onAddComment={feed.handleAddComment}
          onSaveCommentEdit={feed.handleSaveCommentEdit}
          onDeleteComment={feed.handleDeleteComment}
          onReportContent={feed.handleReportContent}
        />

        <RightSidebar suggestions={feed.suggestions} />
      </main>

      <LoginRequiredDialog
        open={feed.showLoginDialog}
        onClose={() => feed.setShowLoginDialog(false)}
      />
    </div>
  );
}
