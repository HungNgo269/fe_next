import Link from "next/link";
import type { AvatarInfo, NavItem } from "../types/feed";
import Avatar from "./ui/Avatar";

type LeftSidebarProps = {
  currentUser: AvatarInfo;
  navItems: NavItem[];
};

export default function LeftSidebar({ currentUser, navItems }: LeftSidebarProps) {
  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar
            initials={currentUser.initials}
            colorClass={currentUser.colorClass}
            online
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-500">@{currentUser.handle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-50 px-2 py-3">
            <p className="text-lg font-semibold text-slate-900">238</p>
            <p className="text-xs text-slate-500">Friends</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-2 py-3">
            <p className="text-lg font-semibold text-slate-900">14</p>
            <p className="text-xs text-slate-500">Groups</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-2 py-3">
            <p className="text-lg font-semibold text-slate-900">6</p>
            <p className="text-xs text-slate-500">Events</p>
          </div>
        </div>
        <Link
          className="mt-4 block w-full rounded-full border border-slate-200/70 bg-white py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
          href="/profile"
        >
          View profile
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {navItems.map((item) => (
          <button
            className="flex w-full items-center justify-between rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-left text-sm transition-colors hover:border-slate-200/70 hover:bg-white/90"
            key={item.label}
            type="button"
          >
            <div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </button>
        ))}
      </div>
    </aside>
  );
}
