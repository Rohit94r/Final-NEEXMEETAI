"use client";

import { toast } from "sonner";
import { XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUri } from "@/lib/avatar";
import type { MeetingGetOne } from "../../types";

interface MeetingMembersCardProps {
  meetingId: string;
  members: MeetingGetOne["participants"];
  canManage: boolean;
}

export const MeetingMembersCard = ({
  meetingId,
  members,
  canManage,
}: MeetingMembersCardProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const removeMember = useMutation(
    trpc.meetings.removeMember.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getOne.queryOptions({ id: meetingId }),
        );
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );

        toast.success("Member removed");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col gap-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium">Members</h3>
          <p className="text-sm text-muted-foreground">
            Invited members can join the call, watch, and talk once the host starts the meeting.
          </p>
        </div>
        <Badge variant="outline">{members.length} total</Badge>
      </div>
      <div className="grid gap-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2 gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar>
                <AvatarImage
                  src={
                    member.image ??
                    generateAvatarUri({
                      seed: member.name,
                      variant: "initials",
                    })
                  }
                  alt={member.name}
                />
                <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {member.role}
              </Badge>
              {canManage && member.role !== "admin" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={removeMember.isPending}
                  onClick={() =>
                    removeMember.mutate({
                      meetingId,
                      memberUserId: member.id,
                    })
                  }
                >
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
