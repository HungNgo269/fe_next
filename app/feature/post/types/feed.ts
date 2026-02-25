export type AvatarInfo = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  colorClass: string;
};

export type CommentData = {
  id: string;
  author: AvatarInfo;
  text: string;
  time: string;
};

export type PostMedia = {
  title: string;
  subtitle: string;
  gradientClass: string;
};

export type PostData = {
  id: string;
  author: AvatarInfo;
  time: string;
  audience: string;
  content: string;
  likes: number;
  shares: number;
  likedByMe: boolean;
  comments: CommentData[];
  media?: PostMedia;
};

export type StoryData = {
  id: string;
  title: string;
  author: AvatarInfo;
  theme: string;
};

export type NavItem = {
  label: string;
  description: string;
};

export type SidebarMessagePreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
};

export type SidebarNotificationItem = {
  id: string;
  title: string;
  time: string;
};

export type TrendingTopic = {
  topic: string;
  posts: string;
};

export type Suggestion = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  colorClass: string;
  note: string;
};
