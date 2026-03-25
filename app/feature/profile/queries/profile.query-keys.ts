import type { UserListType } from '../types/user-list.types';

export const profileQueryKeys = {
  all: ['profile-feed'] as const,
  detail: (profileKey: string) => ['profile-feed', profileKey] as const,
  me: () => ['profile-feed', 'me'] as const,
  friendRequests: () => ['friend-requests'] as const,
  userListAll: () => ['user-list'] as const,
  userList: (userId: string, listType: UserListType | null) =>
    ['user-list', userId, listType] as const,
};
