import type { PostData } from "../types/feed";
import CommentList from "./CommentList";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";
import PostStats from "./PostStats";

type PostCardProps = {
  post: PostData;
  index: number;
  isEditing: boolean;
  editingText: string;
  commentDraft: string;
  currentUserId: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onChangeEditingText: (value: string) => void;
  onToggleLike: () => void;
  onShare: () => void;
  onChangeCommentDraft: (value: string) => void;
  onAddComment: () => void;
  onSaveCommentEdit: (commentId: string, content: string) => Promise<boolean>;
  onDeleteComment: (commentId: string) => Promise<boolean>;
  onReportPost: () => void;
  onReportComment: () => void;
};

const postDelayClasses = [
  "animate-delay-120",
  "animate-delay-200",
  "animate-delay-280",
  "animate-delay-360",
  "animate-delay-440",
];

export default function PostCard({
  post,
  index,
  isEditing,
  editingText,
  commentDraft,
  currentUserId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onChangeEditingText,
  onToggleLike,
  onShare,
  onChangeCommentDraft,
  onAddComment,
  onSaveCommentEdit,
  onDeleteComment,
  onReportPost,
  onReportComment,
}: PostCardProps) {
  const delayClass = postDelayClasses[index % postDelayClasses.length];

  return (
    <article className={`ui-card rounded-lg p-5 ${delayClass}`}>
      <PostHeader
        author={post.author}
        time={post.time}
        audience={post.audience}
        isPostOwner={post.author.id === currentUserId}
        onStartEdit={onStartEdit}
        onDelete={onDelete}
        onReportPost={onReportPost}
      />

      <PostBody
        content={post.content}
        media={post.media}
        isEditing={isEditing}
        editingText={editingText}
        onChangeEditingText={onChangeEditingText}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />

      <PostStats
        likes={post.likes}
        commentsCount={post.comments.length}
        shares={post.shares}
      />

      <PostActions
        likedByMe={post.likedByMe}
        onToggleLike={onToggleLike}
        onShare={onShare}
      />

      <CommentList
        comments={post.comments}
        currentUserId={currentUserId}
        commentDraft={commentDraft}
        onChangeCommentDraft={onChangeCommentDraft}
        onAddComment={onAddComment}
        onSaveCommentEdit={onSaveCommentEdit}
        onDeleteComment={onDeleteComment}
        onReportComment={onReportComment}
      />
    </article>
  );
}
