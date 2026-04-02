"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    {
      ...trpc.meetings.getCallDetails.queryOptions({ id: meetingId }),
      refetchInterval: 3000,
    },
  );
  const requestedRef = useRef(false);
  const requestJoinAccess = useMutation(
    trpc.meetings.requestJoinAccess.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getCallDetails.queryOptions({ id: meetingId }),
        );
      },
    }),
  );

  useEffect(() => {
    if (data.accessState !== "can_request_access" || requestedRef.current) {
      return;
    }

    requestedRef.current = true;
    requestJoinAccess.mutate({ meetingId });
  }, [data.accessState, meetingId, requestJoinAccess]);

  if (data.status === "completed" || data.status === "processing" || data.status === "cancelled") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Meeting has ended"
          description="You can no longer join this meeting"
        />
      </div>
    );
  }

  if (data.accessState === "pending" || data.accessState === "can_request_access") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Request sent"
          description="Your join request has been sent to the meeting host. Please wait for approval."
        />
      </div>
    );
  }

  if (data.accessState === "waiting_for_host") {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorState
          title="Waiting for host"
          description="You have been approved. The meeting admin needs to start the meeting before you can join."
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
