import type { Post } from "../types/api.types";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import PostHeader from "./PostHeader";
import PostStats from "./PostStats";

export default function PostCard({
  post,
  index,
  onOpenDetail,
}: {
  post: Post;
  index: number;
  onOpenDetail?: (post: Post) => void;
}) {
  const interactionPostId = post.sourcePostId ?? post.id;
  const openDetail = () => onOpenDetail?.(post);

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
        media={undefined}
        onClickContent={openDetail}
      />

      <PostStats
        likes={post.likesCount}
        commentsCount={post.commentsCount}
        shares={post.sharesCount}
        onClickComments={openDetail}
      />

      <PostActions
        postId={interactionPostId}
        likedByMe={post.likedByMe}
        onClickComment={openDetail}
      />
    </article>
  );
}
