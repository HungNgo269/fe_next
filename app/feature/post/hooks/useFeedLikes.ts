import {
  createLikeRequest,
  deleteLikeRequest,
  fetchCurrentUserLikeIdsByPostIds,
} from "../api/feedApi";
import type { PostData } from "../types/feed";

export type UseFeedLikesResult = {
  handleToggleLike: (postId: string) => Promise<void>;
  handleShare: (postId: string) => void;
  hydrateLikeIds: (
    nextPosts: PostData[],
    userId: string,
    active: { value: boolean },
  ) => Promise<void>;
};

type UseFeedLikesParams = {
  currentUserId: string;
  posts: PostData[];
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
  myLikeIdsByPostId: Record<string, string>;
  setMyLikeIdsByPostId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFeedError: React.Dispatch<React.SetStateAction<string>>;
  /** When provided, unauthenticated users are prompted to log in instead of getting an error. */
  isAuthenticated?: boolean;
  requireAuth?: () => void;
};

export function useFeedLikes({
  currentUserId,
  posts,
  setPosts,
  myLikeIdsByPostId,
  setMyLikeIdsByPostId,
  setFeedError,
  isAuthenticated = true,
  requireAuth,
}: UseFeedLikesParams): UseFeedLikesResult {
  const hydrateLikeIds = async (
    nextPosts: PostData[],
    userId: string,
    active: { value: boolean },
  ) => {
    if (!userId || nextPosts.length === 0) return;
    const result = await fetchCurrentUserLikeIdsByPostIds(
      nextPosts.map((p) => p.id),
      userId,
    );
    if (!active.value || !result.ok) return;
    setMyLikeIdsByPostId((prev) => ({ ...prev, ...result.data }));
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }

    const currentLikeId = myLikeIdsByPostId[postId];
    const targetPost = posts.find((post) => post.id === postId);
    if (!targetPost) return;

    if (targetPost.likedByMe) {
      let likeId = currentLikeId;
      if (!likeId) {
        const hydrateResult = await fetchCurrentUserLikeIdsByPostIds([postId], currentUserId);
        if (!hydrateResult.ok) {
          setFeedError(hydrateResult.error.messages[0] ?? "Unable to unlike post.");
          return;
        }
        likeId = hydrateResult.data[postId];
        if (likeId) setMyLikeIdsByPostId((prev) => ({ ...prev, [postId]: likeId }));
      }
      if (!likeId) { setFeedError("Unable to unlike post."); return; }

      const unlikeResult = await deleteLikeRequest(likeId);
      if (!unlikeResult.ok) {
        setFeedError(unlikeResult.error.messages[0] ?? "Unable to unlike post.");
        return;
      }
      setMyLikeIdsByPostId((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } else {
      const likeResult = await createLikeRequest(postId, currentUserId);
      if (!likeResult.ok) {
        setFeedError(likeResult.error.messages[0] ?? "Unable to like post.");
        return;
      }
      setMyLikeIdsByPostId((prev) => ({ ...prev, [postId]: likeResult.data.id }));
    }

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextLiked = !post.likedByMe;
        return { ...post, likedByMe: nextLiked, likes: post.likes + (nextLiked ? 1 : -1) };
      }),
    );
  };

  const handleShare = (postId: string) => {
    if (!isAuthenticated) { requireAuth?.(); return; }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post,
      ),
    );
  };

  return { handleToggleLike, handleShare, hydrateLikeIds };
}
