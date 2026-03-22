import { fetchPostByIdServer } from "@/app/feature/post/api/postApi.server";
import PostPermalinkView from "@/app/feature/post/components/PostPermalinkView";
import PostPermalinkErrorNotice from "@/app/feature/post/components/PostPermalinkErrorNotice";

export default async function PostPermalinkPage({
  params,
}: {
  params: { postId: string };
}) {
  const { postId } = await params;
  const result = await fetchPostByIdServer(postId);

  if (!result.ok) {
    return <PostPermalinkErrorNotice />;
  }

  return <PostPermalinkView post={result.data} />;
}
