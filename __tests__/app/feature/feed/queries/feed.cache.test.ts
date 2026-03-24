import { QueryClient } from "@tanstack/react-query";
import type { Post } from "@/app/feature/post/types/api.types";
import {
  findFeedPost,
  getFeedPosts,
  getFeedPostsFromCache,
  mergeFeedPosts,
  prependFeedPost,
  replaceFeedPosts,
  updateFeedPosts,
  type FeedPostsInfiniteData,
} from "@/app/feature/feed/queries/feed.cache";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";

const createPost = (
  id: string,
  overrides: Partial<Post> = {},
): Post => ({
  id,
  content: `post-${id}`,
  mediaUrls: [],
  createdAt: "2026-03-24T12:00:00.000Z",
  author: {
    id: "author-1",
    name: "Author",
    email: "author@example.com",
  },
  commentsCount: 0,
  likesCount: 0,
  sharesCount: 0,
  likedByMe: false,
  ...overrides,
});

const createData = (...pages: Post[][]): FeedPostsInfiniteData => ({
  pages: pages.map((posts, index) => ({
    posts,
    pagination: {
      page: index + 1,
      limit: 5,
      hasMore: index < pages.length - 1,
      totalPosts: pages.flat().length,
    },
  })),
  pageParams: pages.map((_, index) => index + 1),
});

describe("feed cache helpers", () => {
  it("flattens pages and removes duplicate posts by id", () => {
    const first = createPost("1");
    const second = createPost("2");
    const duplicateSecond = createPost("2", { content: "updated" });

    expect(getFeedPosts(createData([first, second], [duplicateSecond]))).toEqual([
      first,
      second,
    ]);
  });

  it("replaces the first page and clears later pages", () => {
    const next = replaceFeedPosts(
      createData([createPost("1")], [createPost("2")]),
      [createPost("3")],
    );

    expect(next.pages[0]?.posts.map((post) => post.id)).toEqual(["3"]);
    expect(next.pages[1]?.posts).toEqual([]);
  });

  it("prepends a new post without duplicating an existing one", () => {
    const existing = createPost("1");
    const incoming = createPost("2");
    const data = createData([existing]);

    expect(prependFeedPost(data, incoming).pages[0]?.posts.map((post) => post.id)).toEqual([
      "2",
      "1",
    ]);
    expect(prependFeedPost(data, existing).pages[0]?.posts.map((post) => post.id)).toEqual([
      "1",
    ]);
  });

  it("merges and updates feed posts through helper callbacks", () => {
    const first = createPost("1");
    const second = createPost("2");
    const data = createData([first]);

    expect(mergeFeedPosts(data, [second, first]).pages[0]?.posts.map((post) => post.id)).toEqual([
      "1",
      "2",
    ]);

    expect(
      updateFeedPosts(data, (posts) => posts.map((post) => ({ ...post, likedByMe: true })))
        .pages[0]?.posts[0]?.likedByMe,
    ).toBe(true);
  });

  it("finds posts by id or sourcePostId and reads them from query cache", () => {
    const shared = createPost("2", { sourcePostId: "1" });
    const data = createData([createPost("1"), shared]);
    const queryClient = new QueryClient();

    queryClient.setQueryData(feedQueryKeys.list(), data);

    expect(findFeedPost(data, "2")?.id).toBe("2");
    expect(findFeedPost(data, "1")?.id).toBe("1");
    expect(getFeedPostsFromCache(queryClient).map((post) => post.id)).toEqual([
      "1",
      "2",
    ]);
  });
});
