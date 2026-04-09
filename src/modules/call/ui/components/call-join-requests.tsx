"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { BellIcon, CheckIcon, UsersIcon, XIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUri } from "@/lib/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  meetingId: string;
}

export const CallJoinRequests = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const previousCountRef = useRef(0);

  const { data } = useQuery({
    ...trpc.meetings.getOne.queryOptions({ id: meetingId }),
    refetchInterval: 3000,
  });

  const pendingRequests = data?.pendingRequests ?? [];

  useEffect(() => {
    if (pendingRequests.length > previousCountRef.current) {
      toast.info("New participant is waiting", {
        description: "Open requests and admit them to the meeting.",
      });
    }

    previousCountRef.current = pendingRequests.length;
  }, [pendingRequests.length]);

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
        toast.success("Participant admitted");
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          type="button" 
          size="sm"
          className="relative border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white h-9 px-3"
        >
          <BellIcon className="size-4" />
          <span className="hidden sm:inline ml-1.5">Requests</span>
          {pendingRequests.length > 0 ? (
            <Badge className="ml-1 bg-primary text-primary-foreground">{pendingRequests.length}</Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            Join Requests
          </SheetTitle>
          <SheetDescription>
            Admit people who opened your shared meeting link.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 flex flex-col gap-3">
          {pendingRequests.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              No one is waiting right now.
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border p-3 flex flex-col gap-3"
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
                    <AvatarFallback>
                      {request.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{request.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.email}
                    </p>
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
                    size="sm"
                    variant="outline"
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
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
