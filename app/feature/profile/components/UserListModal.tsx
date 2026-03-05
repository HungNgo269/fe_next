"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Search, Loader2 } from "lucide-react";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import type { UserListType, UserListUser } from "../types/user-list.types";
import {
  fetchFollowers,
  fetchFollowing,
  fetchFriends,
} from "../api/userListApi";
import { useAppSessionStore } from "@/app/share/stores/appSessionStore";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listType: UserListType | null;
  userId: string;
}

export default function UserListModal({
  isOpen,
  onClose,
  listType,
  userId,
}: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const authProfile = useAppSessionStore((state) => state.authProfile);

  // Reset search when modal opens/closes or listType changes
  useEffect(() => {
    setSearchQuery("");
  }, [isOpen, listType]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["user-list", userId, listType],
    queryFn: async () => {
      if (!listType || !userId) return [];
      
      let res;
      if (listType === "followers") {
        res = await fetchFollowers(userId);
      } else if (listType === "following") {
        res = await fetchFollowing(userId);
      } else {
        res = await fetchFriends(userId);
      }
      return res.ok ? res.data : [];
    },
    enabled: isOpen && !!listType && !!userId,
  });

  const getTitle = () => {
    if (listType === "followers") return "Followers";
    if (listType === "following") return "Following";
    if (listType === "friends") return "Friends";
    return "";
  };

  const filteredUsers =
    users?.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.handle && u.handle.toLowerCase().includes(searchQuery.toLowerCase())),
    ) ?? [];

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-muted/50 py-2 pl-9 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="h-[350px] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <p>No results found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10">
                          <ProfileAvatarPreview
                            avatarUrl={user.avatarUrl ?? ""}
                            fallbackInitials={user.name.charAt(0).toUpperCase()}
                            name={user.name}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {user.handle || user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.name}
                          </span>
                        </div>
                      </div>
                      
                      {/* Follow Button Placeholder */}
                      {authProfile?.id !== user.id && (
                        <button className={`ui-btn-primary rounded-md px-3 py-1.5 text-xs font-semibold ${user.isFollowing ? 'bg-muted text-foreground hover:bg-muted/80 border border-border' : ''}`}>
                          {user.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
