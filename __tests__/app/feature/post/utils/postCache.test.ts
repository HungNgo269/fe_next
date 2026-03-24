import { QueryClient } from "@tanstack/react-query";
import type { Post } from "@/app/feature/post/types/api.types";
import {
  findPostInCaches,
  mergeUniquePosts,
} from "@/app/feature/post/utils/postCache";
import { feedQueryKeys } from "@/app/feature/feed/queries/feed.query-keys";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";

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

describe("postCache", () => {
  it("merges only unique posts by id", () => {
    const first = createPost("1");
    const duplicate = createPost("1", { content: "changed" });
    const second = createPost("2");

    expect(mergeUniquePosts([first], [duplicate, second])).toEqual([
      first,
      second,
    ]);
  });

  it("finds a post in the feed cache first", () => {
    const queryClient = new QueryClient();
    const post = createPost("1");

    queryClient.setQueryData(feedQueryKeys.list(), {
      pages: [
        {
          posts: [post],
          pagination: { page: 1, limit: 5, hasMore: false, totalPosts: 1 },
        },
      ],
      pageParams: [1],
    });

    expect(findPostInCaches(queryClient, "1")).toEqual(post);
  });

  it("falls back to the profile caches and matches sourcePostId", () => {
    const queryClient = new QueryClient();
    const sharedPost = createPost("shared-1", { sourcePostId: "origin-1" });

    queryClient.setQueryData(profileQueryKeys.me(), {
      posts: [sharedPost],
    });

    expect(findPostInCaches(queryClient, "origin-1")).toEqual(sharedPost);
  });

  it("returns undefined when the post is absent from every cache", () => {
    const queryClient = new QueryClient();

    expect(findPostInCaches(queryClient, "missing")).toBeUndefined();
  });
});
