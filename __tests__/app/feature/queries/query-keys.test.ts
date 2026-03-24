import {
  FEED_PAGE_SIZE,
  feedQueryKeys,
} from "@/app/feature/feed/queries/feed.query-keys";
import { postQueryKeys } from "@/app/feature/post/queries/post.query-keys";
import { profileQueryKeys } from "@/app/feature/profile/queries/profile.query-keys";
import { FEED_QUERY_KEY } from "@/app/share/hooks/feedQueryKeys";

describe("query key factories", () => {
  it("keeps the feed page size stable", () => {
    expect(FEED_PAGE_SIZE).toBe(5);
  });

  it("builds feed query keys consistently", () => {
    expect(feedQueryKeys.all).toEqual(["feed"]);
    expect(feedQueryKeys.list()).toEqual(["feed", "list"]);
    expect(FEED_QUERY_KEY).toEqual(["feed", "list"]);
  });

  it("builds post query keys consistently", () => {
    expect(postQueryKeys.all).toEqual(["posts"]);
    expect(postQueryKeys.comments("post-1")).toEqual([
      "post-comments",
      "post-1",
    ]);
  });

  it("builds profile query keys consistently", () => {
    expect(profileQueryKeys.all).toEqual(["profile-feed"]);
    expect(profileQueryKeys.detail("me", "me")).toEqual([
      "profile-feed",
      "me",
      "me",
    ]);
    expect(profileQueryKeys.other("alice")).toEqual([
      "profile-feed",
      "other",
      "alice",
    ]);
    expect(profileQueryKeys.friendRequests()).toEqual(["friend-requests"]);
    expect(profileQueryKeys.userList("user-1", "followers")).toEqual([
      "user-list",
      "user-1",
      "followers",
    ]);
  });
});
