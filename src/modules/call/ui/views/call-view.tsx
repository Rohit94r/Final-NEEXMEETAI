"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";

import { CallProvider } from "../components/call-provider";

interface Props {
  meetingId: string;
};

export const CallView = ({
  meetingId
}: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getCallDetails.queryOptions({ id: meetingId }),
  );

  if (data.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  if (data.status === "upcoming" && !data.canManage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Waiting for host"
          description="The meeting admin needs to start the meeting before invited members can join"
        />
      </div>
    );
  }

  return (
    <CallProvider
      meetingId={meetingId}
      meetingName={data.name}
      canManage={data.canManage}
    />
  );
};
