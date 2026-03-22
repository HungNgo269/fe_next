import type { ReactNode } from "react";
import { Bell, Home, Search } from "lucide-react";

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
    key: "notification",
    label: "Notifications",
    badge: true,
    icon: <Bell className="h-5 w-5" />,
  },
];

export const mobileNavItems: NavItem[] = [
  {
    key: "home",
    label: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    key: "search",
    label: "Search",
    icon: <Search className="h-5 w-5" />,
  },
  {
    key: "notification",
    label: "Notifications",
    badge: true,
    icon: <Bell className="h-5 w-5" />,
  },
];
