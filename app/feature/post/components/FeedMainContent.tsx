import FeedComposer from "./FeedComposer";
import FeedStories from "./FeedStories";
import PostCard from "./PostCard";
import type { CurrentUser } from "../hooks/useSocialFeed";
import type { PostData, StoryData } from "../types/feed";

type FeedMainContentProps = {
  isLoadingFeed: boolean;
  feedError: string;
  stories: StoryData[];
  currentUser: CurrentUser;
  composerText: string;
  posts: PostData[];
  editingPostId: string | null;
  editingText: string;
  commentDrafts: Record<string, string>;
  onComposerChange: (nextValue: string) => void;
  onCreatePost: () => Promise<void>;
  onStartEdit: (post: PostData) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onChangeEditingText: (value: string) => void;
  onToggleLike: (postId: string) => Promise<void>;
  onShare: (postId: string) => void;
  onChangeCommentDraft: (postId: string, value: string) => void;
  onAddComment: (postId: string) => Promise<void>;
  onSaveCommentEdit: (
    postId: string,
    commentId: string,
    content: string,
  ) => Promise<boolean>;
  onDeleteComment: (postId: string, commentId: string) => Promise<boolean>;
  onReportContent: (contentType: "post" | "comment") => void;
};

export default function FeedMainContent({
  isLoadingFeed,
  feedError,
  stories,
  currentUser,
  composerText,
  posts,
  editingPostId,
  editingText,
  commentDrafts,
  onComposerChange,
  onCreatePost,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeletePost,
  onChangeEditingText,
  onToggleLike,
  onShare,
  onChangeCommentDraft,
  onAddComment,
  onSaveCommentEdit,
  onDeleteComment,
  onReportContent,
}: FeedMainContentProps) {
  return (
    <section className="col-span-12 min-w-0 space-y-6 lg:col-span-6">
      {isLoadingFeed ? (
        <div className="ui-card ui-text-muted rounded-2xl px-4 py-3 text-sm">
          Syncing feed from backend...
        </div>
      ) : null}
      {feedError ? (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
          {feedError}
        </div>
      ) : null}

      <FeedStories stories={stories} />

      <FeedComposer
        currentUser={currentUser}
        value={composerText}
        onChange={onComposerChange}
        onSubmit={onCreatePost}
      />

      <div className="space-y-6">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            index={index}
            post={post}
            isEditing={editingPostId === post.id}
            editingText={editingPostId === post.id ? editingText : post.content}
            commentDraft={commentDrafts[post.id] ?? ""}
            onStartEdit={() => onStartEdit(post)}
            onCancelEdit={onCancelEdit}
            onSaveEdit={() => onSaveEdit(post.id)}
            onDelete={() => onDeletePost(post.id)}
            onChangeEditingText={onChangeEditingText}
            onToggleLike={() => onToggleLike(post.id)}
            onShare={() => onShare(post.id)}
            onChangeCommentDraft={(value) =>
              onChangeCommentDraft(post.id, value)
            }
            onAddComment={() => onAddComment(post.id)}
            currentUserId={currentUser.id}
            onSaveCommentEdit={(commentId, content) =>
              onSaveCommentEdit(post.id, commentId, content)
            }
            onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
            onReportPost={() => onReportContent("post")}
            onReportComment={() => onReportContent("comment")}
          />
        ))}
      </div>
    </section>
  );
}
