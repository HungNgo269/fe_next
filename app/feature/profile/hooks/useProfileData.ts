"use client";

import { useMemo, useState, useCallback } from "react";
import type { UserProfile } from "@/app/feature/profile/types/profile";
import {
  toAvatarFromProfile,
  useAppSessionStore,
} from "@/app/share/stores/appSessionStore";

const EMPTY_PROFILE: UserProfile = {
  name: "",
  email: "",
  gender: "",
  avatar: "",
  bio: "",
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
};

export type ProfileLoadingState = {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isUnauthorized: boolean;
  setIsUnauthorized: React.Dispatch<React.SetStateAction<boolean>>;
  profileError: string;
  setProfileError: React.Dispatch<React.SetStateAction<string>>;
  currentUserId: string;
  currentUserAvatar: ReturnType<typeof toAvatarFromProfile>;
  canEditProfile: boolean;
  syncProfileToSession: (incoming: UserProfile) => void;
};

export function useProfileData(isOwnProfile: boolean): ProfileLoadingState {
  const authProfile = useAppSessionStore((state) => state.authProfile);
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );

  const currentUserId = authProfile?.id ?? "";
  const currentUserAvatar = useMemo(
    () => toAvatarFromProfile(authProfile),
    [authProfile],
  );

  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [profileError, setProfileError] = useState("");
  const canEditProfile =
    Boolean(currentUserId) &&
    (isOwnProfile || (Boolean(profile.id) && currentUserId === profile.id));

  const syncProfileToSession = useCallback(
    (incoming: UserProfile) => {
      if (isOwnProfile && incoming.id) {
        setAuthenticatedProfile({
          id: incoming.id,
          handle: incoming.handle ?? null,
          name: incoming.name,
          email: incoming.email,
          gender: incoming.gender,
          avatar: incoming.avatar,
          bio: incoming.bio,
          followersCount: incoming.followersCount,
          followingCount: incoming.followingCount,
          isFollowing: incoming.isFollowing,
        });
      }
    },
    [isOwnProfile, setAuthenticatedProfile],
  );

  return {
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    isUnauthorized,
    setIsUnauthorized,
    profileError,
    setProfileError,
    currentUserId,
    currentUserAvatar,
    canEditProfile,
    syncProfileToSession,
  };
}
