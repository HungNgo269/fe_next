import type {
  AvatarInfo,
  NavItem,
  PostData,
  StoryData,
  Suggestion,
  TrendingTopic,
} from "../types/feed";

export const currentUser: AvatarInfo = {
  name: "You",
  handle: "pulse.user",
  initials: "YU",
  colorClass: "avatar-blue",
};

export const navItems: NavItem[] = [
  { label: "Feed", description: "Latest from your circle" },
  { label: "Friends", description: "28 active chats" },
  { label: "Groups", description: "Design + Product" },
  { label: "Events", description: "3 upcoming" },
  { label: "Marketplace", description: "New drops" },
  { label: "Saved", description: "12 collections" },
];

export const stories: StoryData[] = [
  {
    id: "story-1",
    title: "Studio morning",
    author: {
      name: "Maya Tran",
      handle: "maya.t",
      initials: "MT",
      colorClass: "avatar-teal",
    },
    theme: "gradient-theme-teal",
  },
  {
    id: "story-2",
    title: "City lights",
    author: {
      name: "Luis Ortega",
      handle: "luis.o",
      initials: "LO",
      colorClass: "avatar-orange",
    },
    theme: "gradient-theme-orange",
  },
  {
    id: "story-3",
    title: "Lunch break",
    author: {
      name: "Amina Yusuf",
      handle: "amina.y",
      initials: "AY",
      colorClass: "avatar-green",
    },
    theme: "gradient-theme-green",
  },
  {
    id: "story-4",
    title: "New sketch",
    author: {
      name: "Jae Park",
      handle: "jae.p",
      initials: "JP",
      colorClass: "avatar-indigo",
    },
    theme: "gradient-theme-indigo",
  },
];

export const initialPosts: PostData[] = [
  {
    id: "post-1",
    author: {
      name: "Maya Tran",
      handle: "maya.t",
      initials: "MT",
      colorClass: "avatar-teal",
    },
    time: "2h",
    audience: "Public",
    content:
      "Shipped a calmer notification flow today. Keeping the tone gentle made a huge difference in how the UI feels.",
    likes: 128,
    shares: 14,
    likedByMe: true,
    comments: [
      {
        id: "comment-1",
        author: {
          name: "Amina Yusuf",
          handle: "amina.y",
          initials: "AY",
          colorClass: "avatar-green",
        },
        text: "Love the focus on tone. Feels more human.",
        time: "1h",
      },
    ],
    media: {
      title: "Notification rhythm",
      subtitle: "Soft gradients, low pressure",
      gradientClass: "post-media-gradient-sunrise",
    },
  },
  {
    id: "post-2",
    author: {
      name: "Luis Ortega",
      handle: "luis.o",
      initials: "LO",
      colorClass: "avatar-orange",
    },
    time: "4h",
    audience: "Friends",
    content:
      "Experimented with a vertical feed that prioritizes creators you interact with most. Feedback welcome.",
    likes: 82,
    shares: 9,
    likedByMe: false,
    comments: [
      {
        id: "comment-2",
        author: {
          name: "Jae Park",
          handle: "jae.p",
          initials: "JP",
          colorClass: "avatar-indigo",
        },
        text: "Feels super intentional. The spacing helps.",
        time: "2h",
      },
      {
        id: "comment-3",
        author: {
          name: "Noah Kim",
          handle: "noah.k",
          initials: "NK",
          colorClass: "avatar-slate",
        },
        text: "Would love a toggle to reorder by recency.",
        time: "45m",
      },
    ],
  },
  {
    id: "post-3",
    author: {
      name: "Amina Yusuf",
      handle: "amina.y",
      initials: "AY",
      colorClass: "avatar-green",
    },
    time: "6h",
    audience: "Public",
    content:
      "Collecting stories for the community spotlight. Drop a quick line about what you are building this week.",
    likes: 204,
    shares: 27,
    likedByMe: false,
    comments: [],
    media: {
      title: "Community spotlight",
      subtitle: "Share your build",
      gradientClass: "post-media-gradient-mint",
    },
  },
];

export const trendingTopics: TrendingTopic[] = [
  { topic: "Creator economy", posts: "2.1k posts" },
  { topic: "Design systems", posts: "1.4k posts" },
  { topic: "AI for community", posts: "980 posts" },
  { topic: "Product launches", posts: "640 posts" },
];

export const suggestions: Suggestion[] = [
  {
    name: "Noah Kim",
    handle: "noah.k",
    initials: "NK",
    colorClass: "avatar-slate",
    note: "Product strategist",
  },
  {
    name: "Priya Rao",
    handle: "priya.r",
    initials: "PR",
    colorClass: "avatar-purple",
    note: "Community lead",
  },
  {
    name: "Elena Novak",
    handle: "elena.n",
    initials: "EN",
    colorClass: "avatar-orange",
    note: "Visual designer",
  },
];
