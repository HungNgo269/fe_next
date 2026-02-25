import { useEffect, useState } from "react";
import { fetchFeedBootstrap } from "../api/feedApi";
import {
  initialPosts,
  stories as fallbackStories,
  suggestions as fallbackSuggestions,
} from "../data/feed";
import type {
  AvatarInfo,
  PostData,
  SidebarMessagePreview,
  SidebarNotificationItem,
  StoryData,
  Suggestion,
} from "../types/feed";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

export type CurrentUser = AvatarInfo;

const GUEST_USER: CurrentUser = {
  id: "guest-user",
  name: "Guest",
  handle: "guest",
  initials: "GU",
  colorClass: "avatar-slate",
};

export type UseFeedBootstrapResult = {
  isLoadingFeed: boolean;
  feedError: string;
  setFeedError: React.Dispatch<React.SetStateAction<string>>;
  isAuthenticated: boolean;
  showLoginDialog: boolean;
  setShowLoginDialog: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: CurrentUser;
  stories: StoryData[];
  suggestions: Suggestion[];
  sidebarMessages: SidebarMessagePreview[];
  sidebarNotifications: SidebarNotificationItem[];
  posts: PostData[];
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>;
  myLikeIdsByPostId: Record<string, string>;
  setMyLikeIdsByPostId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  requireAuth: () => void;
  isOwnerById: (ownerId?: string) => boolean;
};

export function useFeedBootstrap(): UseFeedBootstrapResult {
  const setAuthenticatedProfile = useAppSessionStore(
    (state) => state.setAuthenticatedProfile,
  );
  const clearAuthenticatedProfile = useAppSessionStore(
    (state) => state.clearAuthenticatedProfile,
  );

  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(GUEST_USER);
  const [stories, setStories] = useState<StoryData[]>(() => fallbackStories);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => fallbackSuggestions);
  const [sidebarMessages, setSidebarMessages] = useState<SidebarMessagePreview[]>([]);
  const [sidebarNotifications, setSidebarNotifications] = useState<SidebarNotificationItem[]>([]);
  const [myLikeIdsByPostId, setMyLikeIdsByPostId] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<PostData[]>(() => initialPosts);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const result = await fetchFeedBootstrap();
      if (!active) return;

      if (!result.ok) {
        setFeedError(result.error.messages[0] ?? "Unable to load feed API.");
        setIsLoadingFeed(false);
        return;
      }

      setCurrentUser(result.data.currentUser);
      setIsAuthenticated(result.data.isAuthenticated);
      if (result.data.currentUserProfile) {
        setAuthenticatedProfile(result.data.currentUserProfile);
      } else {
        clearAuthenticatedProfile();
      }
      setPosts(result.data.posts);
      setStories(result.data.stories);
      setSuggestions(result.data.suggestions);
      setSidebarMessages(result.data.sidebarMessages);
      setSidebarNotifications(result.data.sidebarNotifications);
      setMyLikeIdsByPostId(result.data.userLikeByPostId);
      setFeedError("");
      setIsLoadingFeed(false);
    };

    void bootstrap();
    return () => { active = false; };
  }, [clearAuthenticatedProfile, setAuthenticatedProfile]);

  const requireAuth = () => setShowLoginDialog(true);
  const isOwnerById = (ownerId?: string) =>
    Boolean(ownerId) && ownerId === currentUser.id;

  return {
    isLoadingFeed,
    feedError,
    setFeedError,
    isAuthenticated,
    showLoginDialog,
    setShowLoginDialog,
    currentUser,
    stories,
    suggestions,
    sidebarMessages,
    sidebarNotifications,
    posts,
    setPosts,
    myLikeIdsByPostId,
    setMyLikeIdsByPostId,
    requireAuth,
    isOwnerById,
  };
}
