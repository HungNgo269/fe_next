import type { UserListType } from '../types/user-list.types';

export const profileQueryKeys = {
  all: ['profile-feed'] as const,
  detail: (scope: 'me' | 'other', profileKey: string) =>
    ['profile-feed', scope, profileKey] as const,
  me: () => ['profile-feed', 'me', 'me'] as const,
  other: (handle: string) => ['profile-feed', 'other', handle] as const,
  friendRequests: () => ['friend-requests'] as const,
  userListAll: () => ['user-list'] as const,
  userList: (userId: string, listType: UserListType | null) =>
    ['user-list', userId, listType] as const,
};
