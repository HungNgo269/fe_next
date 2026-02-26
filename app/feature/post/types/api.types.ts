/** Shape returned by the new `GET /posts` endpoint (nested data). */
export type Post = {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  author: {
    id: string;
    handle?: string | null;
    name: string;
    email: string;
    avatarUrl?: string | null;
    gender?: string;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      handle?: string | null;
      name: string;
      email: string;
      avatarUrl?: string | null;
      gender?: string;
    };
  }>;
  likesCount: number;
  likedByMe: boolean;
};

export type User = {
  id: string;
  name: string;
  handle?: string | null;
  email: string;
  gender?: string;
  avatarUrl?: string | null;
};

export type Like = {
  id: string;
  postId: string;
  userId: string;
};

export type Comment = {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt?: string;
};
