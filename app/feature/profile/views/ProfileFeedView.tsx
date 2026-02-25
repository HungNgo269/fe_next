import Link from "next/link";
import type { ReactNode } from "react";
import FeedComposer from "@/app/feature/post/components/FeedComposer";
import PostCard from "@/app/feature/post/components/PostCard";
import ProfileAvatarPreview from "@/app/feature/profile/components/ProfileAvatarPreview";
import ProfileStatusCard from "@/app/feature/profile/components/ProfileStatusCard";
import type { useProfileFeed } from "@/app/feature/profile/hooks/useProfileFeed";

type ProfileFeedState = ReturnType<typeof useProfileFeed>;

type ProfileFeedViewProps = ProfileFeedState & {
  headerActions?: ReactNode;
  postsLabel?: string;
  emptyMessage?: string;    
};

export default function ProfileFeedView({
  profile,
  initials,
  currentUserId,
  currentUserAvatar,
  canEditProfile,
  posts,
  composerText,
  editingPostId,
  editingText,
  commentDrafts,
  isLoading,
  isUnauthorized,
  profileError,
  postsError,
  totalPosts,
  hasMorePosts,
  isLoadingMore,
  handleLoadMore,
  handleComposerChange,
  handleCreatePost,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  setEditingText,
  handleDeletePost,
  handleToggleLike,
  handleShare,
  handleCommentDraft,
  handleAddComment,
  handleSaveCommentEdit,
  handleDeleteComment,
  handleReportContent,
  headerActions,
  postsLabel = "Posts",
  emptyMessage = "No posts yet.",
}: ProfileFeedViewProps) {
  if (isLoading) {
    return (
      <main className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-4 pb-16 pt-12 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </main>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
        <ProfileStatusCard
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="ui-btn-ghost rounded-full px-5 py-2 text-xs font-semibold transition"
                href="/"
              >
                Back to feed
              </Link>
            </div>
          }
          message="You can browse the app without logging in, but your personal profile is only available after sign-in."
          title="Profile is locked"
          variant="error"
        />
      </main>
    );
  }

  return (
    <main className="relative mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 pt-12 sm:px-6">
      <section className="ui-card rounded-lg p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatarPreview
              avatarUrl={profile.avatar}
              fallbackInitials={initials}
              name={profile.name}
            />
            <div>
              <p className="text-xl font-semibold text-foreground">
                {profile.name || "Unnamed user"}
              </p>
              <p className="ui-text-muted text-sm">{profile.email || "No email"}</p>
              <p className="ui-text-muted text-xs uppercase tracking-wider">
                {profile.gender || "Unknown"}
              </p>
            </div>
          </div>
          {headerActions ? (
            <div className="flex items-center gap-2">{headerActions}</div>
          ) : null}
        </div>
        {profileError ? (
          <p className="ui-alert-warning mt-4 rounded-2xl px-4 py-3 text-sm">
            {profileError}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <header className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {postsLabel} 
          </h2>
        </header>

        {postsError ? (
          <div className="ui-alert-warning rounded-2xl px-4 py-3 text-sm">{postsError}</div>
        ) : null}

        {canEditProfile ? (
          <FeedComposer
            currentUser={currentUserAvatar}
            value={composerText}
            onChange={handleComposerChange}
            onSubmit={handleCreatePost}
          />
        ) : null}

        {posts.length === 0 ? (
          <p className="ui-text-muted text-sm">{emptyMessage}</p>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  isEditing={editingPostId === post.id}
                  editingText={editingPostId === post.id ? editingText : post.content}
                  commentDraft={commentDrafts[post.id] ?? ""}
                  currentUserId={currentUserId}
                  onStartEdit={() => handleStartEdit(post)}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={() => handleSaveEdit(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                  onChangeEditingText={setEditingText}
                  onToggleLike={() => handleToggleLike(post.id)}
                  onShare={() => handleShare(post.id)}
                  onChangeCommentDraft={(value) => handleCommentDraft(post.id, value)}
                  onAddComment={() => handleAddComment(post.id)}
                  onSaveCommentEdit={(commentId, content) =>
                    handleSaveCommentEdit(post.id, commentId, content)
                  }
                  onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                  onReportPost={() => handleReportContent("post")}
                  onReportComment={() => handleReportContent("comment")}
                />
              ))}
            </div>

            {hasMorePosts ? (
              <div className="pt-2">
                <button
                  className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-60"
                  disabled={isLoadingMore}
                  onClick={() => void handleLoadMore()}
                  type="button"
                >
                  {isLoadingMore ? "Loading..." : "Load 5 more posts"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
