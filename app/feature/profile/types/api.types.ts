/** Actual shape returned by the backend for GET/PATCH /users/me */
export type ProfileResponse = {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatarUrl: string | null;
};

export type ProfileFeedResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    gender: string;
    avatarUrl: string | null;
  };
  posts: Array<{
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    likedByMe: boolean;
    author: {
      id: string;
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
        name: string;
        email: string;
        avatarUrl?: string | null;
        gender?: string;
      };
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
    totalPosts: number;
  };
};
