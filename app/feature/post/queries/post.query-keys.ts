export const postQueryKeys = {
  all: ['posts'] as const,
  comments: (postId: string) => ['post-comments', postId] as const,
};
