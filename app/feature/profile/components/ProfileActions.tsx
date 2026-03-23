"use client";

import { Loader2, UserPlus, Users } from "lucide-react";
import type { FriendshipStatus } from "../types/api.types";
import { useProfileConnectionMutations } from "../mutations/useProfileConnectionMutations";

type OwnProfileActionsProps = {
  variant: "own";
  incomingCount: number;
  onOpenFriendRequests: () => void;
};

type OtherProfileActionsProps = {
  variant: "other";
  profileId: string;
  profileKey: string;
  isFollowing: boolean;
  friendshipStatus: FriendshipStatus;
};

type ProfileActionsProps = OwnProfileActionsProps | OtherProfileActionsProps;

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-60";

function OwnProfileActions({
  incomingCount,
  onOpenFriendRequests,
}: Omit<OwnProfileActionsProps, "variant">) {
  const hasIncoming = incomingCount > 0;

  return (
    <button
      type="button"
      className={`${BUTTON_BASE} ui-btn-ghost`}
      onClick={onOpenFriendRequests}
    >
      <Users className="h-3.5 w-3.5" />
      Friend requests
      {hasIncoming ? (
        <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none text-white">
          {incomingCount}
        </span>
      ) : null}
    </button>
  );
}

function OtherProfileActions({
  profileId,
  profileKey,
  isFollowing,
  friendshipStatus,
}: Omit<OtherProfileActionsProps, "variant">) {
  const {
    follow,
    unfollow,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    isFollowingLoading,
    isFriendActionLoading,
  } = useProfileConnectionMutations(profileId, profileKey);

  const missingProfileId = profileId.length === 0;
  const followDisabled = missingProfileId || isFollowingLoading;
  const friendDisabled = missingProfileId || isFriendActionLoading;

  const renderFriendAction = () => {
    if (friendshipStatus === "PENDING_RECEIVED") {
      return (
        <>
          <button
            type="button"
            className={`${BUTTON_BASE} ui-btn-primary`}
            disabled={friendDisabled}
            onClick={() => acceptFriendRequest()}
          >
            {isFriendActionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Accept
          </button>
          <button
            type="button"
            className={`${BUTTON_BASE} ui-btn-ghost`}
            disabled={friendDisabled}
            onClick={() => declineFriendRequest()}
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
          disabled={friendDisabled}
          onClick={() => cancelFriendRequest()}
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
          disabled={friendDisabled}
          onClick={() => removeFriend()}
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
        disabled={friendDisabled}
        onClick={() => sendFriendRequest()}
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
        disabled={followDisabled}
        onClick={() => (isFollowing ? unfollow() : follow())}
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

export default function ProfileActions(props: ProfileActionsProps) {
  if (props.variant === "own") {
    return (
      <OwnProfileActions
        incomingCount={props.incomingCount}
        onOpenFriendRequests={props.onOpenFriendRequests}
      />
    );
  }

  return (
    <OtherProfileActions
      profileId={props.profileId}
      profileKey={props.profileKey}
      isFollowing={props.isFollowing}
      friendshipStatus={props.friendshipStatus}
    />
  );
}
