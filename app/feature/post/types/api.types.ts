export type Post = {
  id: string;
  sourcePostId?: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  sharedAt?: string;
  sharedBy?: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  author: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    avatarUrl?: string | null;
    gender?: string;
  };
  commentsCount: number;
  likesCount: number;
  sharesCount: number;
  likedByMe: boolean;
};

export type FeedPagination = {
  page: number;
  limit: number;
  hasMore: boolean;
  totalPosts: number;
};

export type PaginatedPostsResponse = {
  posts: Post[];
  pagination: FeedPagination;
};

export type PostComment = {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  author: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    avatarUrl?: string | null;
    gender?: string;
  };
  replies?: PostComment[];
  _count?: { replies: number };
};

export type User = {
  id: string;
  name: string;
  handle?: string | null;
  email: string;
  gender?: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type Like = {
  id: string;
  postId: string;
  userId: string;
};

export type Share = {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId?: string | null;
  createdAt?: string;
};

export type Report = {
  id: string;
  reporterId: string;
  postId?: string | null;
  commentId?: string | null;
  text?: string | null;
  createdAt: string;
  updatedAt: string;
};
