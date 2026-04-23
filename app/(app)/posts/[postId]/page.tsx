import { fetchPostByIdServer } from "@/app/feature/post/api/postApi.server";
import PostPermalinkView from "@/app/feature/post/components/PostPermalinkView";
import PostPermalinkErrorNotice from "@/app/feature/post/components/PostPermalinkErrorNotice";
import AppErrorBoundary from "@/app/share/components/AppErrorBoundary";

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

  return (
    <AppErrorBoundary
      boundaryName="post-permalink-view"
      title="This post is temporarily unavailable"
      message="The permalink view hit an unexpected error. Retry it without leaving the app."
      variant="page"
      actionHref="/"
      actionLabel="Back to feed"
      resetKeys={[result.data.id]}
    >
      <PostPermalinkView post={result.data} />
    </AppErrorBoundary>
  );
}
