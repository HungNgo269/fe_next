import { fetchPostByIdServer } from "@/app/feature/post/api/postApi.server";
import PostPermalinkView from "@/app/feature/post/components/PostPermalinkView";
import Link from "next/link";

export default async function PostPermalinkPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const result = await fetchPostByIdServer(postId);

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
          {result.error.messages[0] ?? "Unable to load post."}
        </div>
        <Link className="mt-4 inline-block text-sm underline" href="/">
          Back to home
        </Link>
      </main>
    );
  }

  return <PostPermalinkView post={result.data} />;
}
