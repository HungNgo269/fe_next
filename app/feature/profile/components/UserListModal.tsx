"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Search, X } from "lucide-react";
import ProfileAvatarPreview from "./ProfileAvatarPreview";
import { useUserListFollowMutation } from "../mutations/useUserListFollowMutation";
import { useUserListQuery } from "../queries/useUserListQuery";
import type { UserListType } from "../types/user-list.types";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listType: UserListType | null;
  userId: string;
  currentUserId?: string | null;
}

const LIST_TITLES: Record<UserListType, string> = {
  followers: "Followers",
  following: "Following",
  friends: "Friends",
};

export default function UserListModal({
  isOpen,
  onClose,
  listType,
  userId,
  currentUserId,
}: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { queryKey, users, isLoading } = useUserListQuery(isOpen, listType, userId);
  const { toggle, isBusy } = useUserListFollowMutation(queryKey);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.handle && u.handle.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setSearchQuery("");
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">
              {listType ? LIST_TITLES[listType] : ""}
            </h2>
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
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <ProfileAvatarPreview
                            avatarUrl={user.avatarUrl ?? ""}
                            name={user.name}
                            size="md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{user.handle || user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.name}</span>
                        </div>
                      </div>

                      {currentUserId !== user.id ? (
                        <button
                          type="button"
                          disabled={isBusy(user.id)}
                          onClick={() => toggle(user)}
                          className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                            user.isFollowing
                              ? "border border-border bg-muted text-foreground hover:bg-muted/80"
                              : "ui-btn-primary"
                          }`}
                        >
                          {isBusy(user.id) ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          {user.isFollowing ? "Following" : "Follow"}
                        </button>
                      ) : null}
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
