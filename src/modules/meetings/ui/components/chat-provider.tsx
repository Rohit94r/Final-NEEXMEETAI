"use client";

import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/feedback/loading-state";

import { ChatUI } from "./chat-ui";

interface Props {
  meetingId: string;
  participantIds: string[];
}

export const ChatProvider = ({ meetingId, participantIds }: Props) => {
  const { data, isPending } = authClient.useSession();

  if (isPending || !data?.user) {
    return (
      <LoadingState
        title="Loading..."
        description="Please wait while we load the chat"
      />
    );
  }

  return (
    <ChatUI
      meetingId={meetingId}
      participantIds={participantIds}
      userId={data.user.id}
      userName={data.user.name}
      userImage={data.user.image ?? ""}
    />
  )
};
