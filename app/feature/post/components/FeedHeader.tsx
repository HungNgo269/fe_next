import type { AvatarInfo } from "../types/feed";
import Avatar from "./ui/Avatar";
import { IconBell, IconPlus, IconSearch } from "./icons";

type FeedHeaderProps = {
  currentUser: AvatarInfo;
};

export default function FeedHeader({ currentUser }: FeedHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
            P
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pulse</p>
            <p className="text-xs text-slate-500">Social studio</p>
          </div>
        </div>

        <div className="relative hidden w-full max-w-md lg:block">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-slate-400"
            placeholder="Search people, posts, groups"
            type="search"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="hidden items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:flex"
            type="button"
          >
            <IconPlus className="h-4 w-4" />
            Create
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
            type="button"
          >
            <IconBell className="h-4 w-4" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 lg:hidden"
            type="button"
          >
            <IconSearch className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white px-2 py-1.5 sm:flex">
            <Avatar
              initials={currentUser.initials}
              colorClass={currentUser.colorClass}
            />
            <div className="pr-2 text-xs font-medium text-slate-600">
              @{currentUser.handle}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
