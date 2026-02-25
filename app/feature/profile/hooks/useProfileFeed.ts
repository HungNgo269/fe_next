"use client";

import { useState } from "react";
import {
  fetchCurrentUserLikeIdsByPostIds,
} from "@/app/feature/post/api/feedApi";
import type { PostData } from "@/app/feature/post/types/feed";
import type { ProfileFeedResult } from "@/app/feature/profile/api/profileApi";
import type { ApiResponse } from "@/app/share/utils/api-types";
import { useEffect } from "react";
import { useProfileData } from "./useProfileData";
import { useFeedPostActions } from "@/app/feature/post/hooks/useFeedPostActions";
import { useFeedLikes } from "@/app/feature/post/hooks/useFeedLikes";
import { useFeedComments } from "@/app/feature/post/hooks/useFeedComments";

const PAGE_SIZE = 5;

export type FetchProfileFeedFn = (
  page: number,
  limit: number,
) => Promise<ApiResponse<ProfileFeedResult>>;

export type UseProfileFeedOptions = {
  fetchFn: FetchProfileFeedFn;
  isOwnProfile?: boolean;
};

export function useProfileFeed({ fetchFn, isOwnProfile = false }: UseProfileFeedOptions) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postsError, setPostsError] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [myLikeIdsByPostId, setMyLikeIdsByPostId] = useState<Record<string, string>>({});

  const profileData = useProfileData(isOwnProfile);

  const likes = useFeedLikes({
    currentUserId: profileData.currentUserId,
    posts,
    setPosts,
    myLikeIdsByPostId,
    setMyLikeIdsByPostId,
    setFeedError: setPostsError,
  });

  const postActions = useFeedPostActions({
    currentUser: profileData.currentUserAvatar,
    posts,
    setPosts,
    setFeedError: setPostsError,
    setTotalPosts,
    setMyLikeIdsByPostId,
  });

  const comments = useFeedComments({
    currentUser: profileData.currentUserAvatar,
    posts,
    setPosts,
    setFeedError: setPostsError,
  });


  const applyFeed = (feed: ProfileFeedResult, append: boolean) => {
    profileData.setProfile(feed.profile);
    profileData.syncProfileToSession(feed.profile);
    setPosts((prev) => (append ? [...prev, ...feed.posts] : feed.posts));
    if (!append) setMyLikeIdsByPostId({});
    setCurrentPage(feed.pagination.page);
    setHasMorePosts(feed.pagination.hasMore);
    setTotalPosts(feed.pagination.totalPosts);
  };


  useEffect(() => {
    const active = { value: true };

    const loadFirstPage = async () => {
      profileData.setIsLoading(true);
      profileData.setProfileError("");
      setPostsError("");

      const result = await fetchFn(1, PAGE_SIZE);
      if (!active.value) return;

      if (!result.ok) {
        const status = (result.error as { status?: number }).status;
        profileData.setIsUnauthorized(status === 401 || status === 403);
        profileData.setProfileError(result.error.messages[0] ?? "Unable to load profile.");
        setPosts([]);
        profileData.setIsLoading(false);
        return;
      }

      applyFeed(result.data, false);
      await likes.hydrateLikeIds(
        result.data.posts,
        result.data.profile.id ?? profileData.currentUserId,
        active,
      );
      profileData.setIsUnauthorized(false);
      profileData.setIsLoading(false);
    };

    void loadFirstPage();
    return () => { active.value = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);


  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMorePosts) return;
    setIsLoadingMore(true);
    setPostsError("");

    const nextPage = currentPage + 1;
    const result = await fetchFn(nextPage, PAGE_SIZE);
    if (!result.ok) {
      setPostsError(result.error.messages[0] ?? "Unable to load more posts.");
      setIsLoadingMore(false);
      return;
    }

    setPosts((prev) => [...prev, ...result.data.posts]);
    setCurrentPage(result.data.pagination.page);
    setHasMorePosts(result.data.pagination.hasMore);
    setTotalPosts(result.data.pagination.totalPosts);

    if (profileData.currentUserId) {
      const likeResult = await fetchCurrentUserLikeIdsByPostIds(
        result.data.posts.map((p) => p.id),
        profileData.currentUserId,
      );
      if (likeResult.ok) {
        setMyLikeIdsByPostId((prev) => ({ ...prev, ...likeResult.data }));
      }
    }
    setIsLoadingMore(false);
  };


  return {
    profile: profileData.profile,
    posts,
    initials: profileData.initials,
    currentUserId: profileData.currentUserId,
    currentUserAvatar: profileData.currentUserAvatar,
    canEditProfile: profileData.canEditProfile,
    composerText: postActions.composerText,
    editingPostId: postActions.editingPostId,
    editingText: postActions.editingText,
    commentDrafts: comments.commentDrafts,
    myLikeIdsByPostId,
    isLoading: profileData.isLoading,
    isLoadingMore,
    isUnauthorized: profileData.isUnauthorized,
    profileError: profileData.profileError,
    postsError,
    currentPage,
    hasMorePosts,
    totalPosts,
    handleLoadMore,
    handleComposerChange: postActions.handleComposerChange,
    handleCreatePost: postActions.handleCreatePost,
    handleStartEdit: postActions.handleStartEdit,
    handleCancelEdit: postActions.handleCancelEdit,
    handleSaveEdit: postActions.handleSaveEdit,
    setEditingText: postActions.setEditingText,
    handleDeletePost: postActions.handleDeletePost,
    handleToggleLike: likes.handleToggleLike,
    handleShare: likes.handleShare,
    handleCommentDraft: comments.handleCommentDraft,
    handleAddComment: comments.handleAddComment,
    handleSaveCommentEdit: comments.handleSaveCommentEdit,
    handleDeleteComment: comments.handleDeleteComment,
    handleReportContent: comments.handleReportContent,
  };
}
