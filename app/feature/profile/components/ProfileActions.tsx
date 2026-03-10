"use client";

import { Loader2, UserPlus, Users } from "lucide-react";
import type { FriendshipStatus } from "../types/api.types";

type OwnProfileActionsProps = {
  variant: "own";
  incomingCount: number;
  onOpenFriendRequests: () => void;
};

type OtherProfileActionsProps = {
  variant: "other";
  isFollowing: boolean;
  isFollowingLoading: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  friendshipStatus: FriendshipStatus;
  isFriendActionLoading: boolean;
  onSendRequest: () => void;
  onCancelRequest: () => void;
  onAcceptRequest: () => void;
  onDeclineRequest: () => void;
  onRemoveFriend: () => void;
};

type ProfileActionsProps = OwnProfileActionsProps | OtherProfileActionsProps;

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60";

export default function ProfileActions(props: ProfileActionsProps) {
  if (props.variant === "own") {
    const hasIncoming = props.incomingCount > 0;

    return (
      <button
        type="button"
        className={`${BUTTON_BASE} ui-btn-ghost`}
        onClick={props.onOpenFriendRequests}
      >
        <Users className="h-3.5 w-3.5" />
        Friend requests
        {hasIncoming ? (
          <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none text-white">
            {props.incomingCount}
          </span>
        ) : null}
      </button>
    );
  }

  const {
    isFollowing,
    isFollowingLoading,
    onFollow,
    onUnfollow,
    friendshipStatus,
    isFriendActionLoading,
    onSendRequest,
    onCancelRequest,
    onAcceptRequest,
    onDeclineRequest,
    onRemoveFriend,
  } = props;

  const renderFriendAction = () => {
    if (friendshipStatus === "PENDING_RECEIVED") {
      return (
        <>
          <button
            type="button"
            className={`${BUTTON_BASE} ui-btn-primary`}
            disabled={isFriendActionLoading}
            onClick={onAcceptRequest}
          >
            {isFriendActionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Accept
          </button>
          <button
            type="button"
            className={`${BUTTON_BASE} ui-btn-ghost`}
            disabled={isFriendActionLoading}
            onClick={onDeclineRequest}
          >
            Decline
          </button>
        </>
      );
    }

    if (friendshipStatus === "PENDING_SENT") {
      return (
        <button
          type="button"
          className={`${BUTTON_BASE} ui-btn-ghost`}
          disabled={isFriendActionLoading}
          onClick={onCancelRequest}
        >
          {isFriendActionLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Remove request
        </button>
      );
    }

    if (friendshipStatus === "ACCEPTED") {
      return (
        <button
          type="button"
          className={`${BUTTON_BASE} ui-btn-ghost`}
          disabled={isFriendActionLoading}
          onClick={onRemoveFriend}
        >
          {isFriendActionLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Friends
        </button>
      );
    }

    return (
      <button
        type="button"
        className={`${BUTTON_BASE} ui-btn-primary`}
        disabled={isFriendActionLoading}
        onClick={onSendRequest}
      >
        {isFriendActionLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        Add friend
      </button>
    );
  };

  return (
    <>
      <button
        type="button"
        className={`${BUTTON_BASE} ${isFollowing ? "ui-btn-ghost" : "ui-btn-primary"}`}
        disabled={isFollowingLoading}
        onClick={isFollowing ? onUnfollow : onFollow}
      >
        {isFollowingLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        {isFollowing ? "Following" : "Follow"}
      </button>
      {renderFriendAction()}
    </>
  );
}
