"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Clock } from "lucide-react";
import { useFriendRequestsController } from "../controllers/useFriendRequestsController";
import FriendRequestRow from "./FriendRequestRow";

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "incoming" | "outgoing";

export default function FriendRequestsModal({
  isOpen,
  onClose,
}: FriendRequestsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("incoming");

  const {
    requests,
    isLoading,
    accept,
    decline,
    cancel,
    isAccepting,
    isDeclining,
    isCancelling,
  } = useFriendRequestsController(isOpen);

  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");
  const displayed = activeTab === "incoming" ? incoming : outgoing;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[420px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">Friend Requests</h2>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex border-b border-border">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "incoming" ? "border-b-2 border-brand text-brand" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("incoming")}
            >
              Received
              {incoming.length > 0 ? (
                <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                  {incoming.length}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "outgoing" ? "border-b-2 border-brand text-brand" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("outgoing")}
            >
              Sent
              {outgoing.length > 0 ? (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {outgoing.length}
                </span>
              ) : null}
            </button>
          </div>

          <div className="h-[350px] overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Clock className="h-8 w-8 opacity-40" />
                <p className="text-sm">
                  {activeTab === "incoming" ? "No pending friend requests" : "No sent requests"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayed.map((user) => (
                  <FriendRequestRow
                    key={user.id}
                    user={user}
                    onAccept={() => accept(user.id)}
                    onDecline={() => decline(user.id)}
                    onCancel={() => cancel(user.id)}
                    isAccepting={isAccepting(user.id)}
                    isDeclining={isDeclining(user.id)}
                    isCancelling={isCancelling(user.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
