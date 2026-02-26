import type { Post } from "../types/api.types";
import CommentSection from "./CommentSection";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";
import PostStats from "./PostStats";

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
}: {
  post: Post;
  index: number;
}) {
  const delayClass = postDelayClasses[index % postDelayClasses.length];

  return (
    <article className={`ui-card rounded-lg p-5 ${delayClass}`}>
      <PostHeader
        postId={post.id}
        author={post.author}
        time={post.createdAt}
        audience="Public"
      />

      <PostBody postId={post.id} content={post.content} media={undefined} />

      <PostStats
        likes={post.likesCount}
        commentsCount={post.comments.length}
        shares={0}
      />

      <PostActions postId={post.id} likedByMe={post.likedByMe} />

      <CommentSection postId={post.id} comments={post.comments} />
    </article>
  );
}
