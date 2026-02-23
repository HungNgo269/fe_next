import type { ReactNode } from "react";
import { Bell, Compass, MessageCircle, Search, Users } from "lucide-react";

export type NavItem = {
  key: string;
  label: string;
  href?: string;
  badge?: boolean;
  icon: ReactNode;
};

export const navItems: NavItem[] = [
  {
    key: "search",
    label: "Search",
    icon: <Search className="h-5 w-5" />,
  },
  {
    key: "friends",
    label: "Friends",
    icon: <Users className="h-5 w-5" />,
  },
  {
    key: "messages",
    label: "Messages",
    badge: true,
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    key: "explore",
    label: "Explore",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    key: "notification",
    label: "Notifications",
    badge: true,
    icon: <Bell className="h-5 w-5" />,
  },
];
