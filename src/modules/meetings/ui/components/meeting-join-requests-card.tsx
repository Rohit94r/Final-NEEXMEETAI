"use client";

import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUri } from "@/lib/avatar";
import type { MeetingGetOne } from "../../types";

interface MeetingJoinRequestsCardProps {
  meetingId: string;
  requests: MeetingGetOne["pendingRequests"];
}

export const MeetingJoinRequestsCard = ({
  meetingId,
  requests,
}: MeetingJoinRequestsCardProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const invalidateMeetingQueries = async () => {
    await queryClient.invalidateQueries(
      trpc.meetings.getOne.queryOptions({ id: meetingId }),
    );
    await queryClient.invalidateQueries(
      trpc.meetings.getCallDetails.queryOptions({ id: meetingId }),
    );
  };

  const admitRequest = useMutation(
    trpc.meetings.admitMember.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetingQueries();
        toast.success("Join request approved");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const rejectRequest = useMutation(
    trpc.meetings.rejectMember.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetingQueries();
        toast.success("Join request rejected");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium">Join Requests</h3>
          <p className="text-sm text-muted-foreground">
            People opening the shared meeting link will appear here until you approve them.
          </p>
        </div>
        <Badge variant="outline">{requests.length} pending</Badge>
      </div>
      <div className="grid gap-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2 gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar>
                <AvatarImage
                  src={
                    request.image ??
                    generateAvatarUri({
                      seed: request.name,
                      variant: "initials",
                    })
                  }
                  alt={request.name}
                />
                <AvatarFallback>{request.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{request.name}</p>
                <p className="text-sm text-muted-foreground truncate">{request.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={admitRequest.isPending || rejectRequest.isPending}
                onClick={() =>
                  admitRequest.mutate({
                    meetingId,
                    memberUserId: request.id,
                  })
                }
              >
                <CheckIcon />
                Admit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={admitRequest.isPending || rejectRequest.isPending}
                onClick={() =>
                  rejectRequest.mutate({
                    meetingId,
                    memberUserId: request.id,
                  })
                }
              >
                <XIcon />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
