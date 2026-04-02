"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderIcon, VideoIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  roomId: string;
  defaultAgentId?: string | null;
}

export const RoomMeetingDialog = ({ roomId, defaultAgentId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState(defaultAgentId ?? "");

  const agents = useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100 }));

  const create = useMutation(
    trpc.rooms.createMeeting.mutationOptions({
      onSuccess: (data) => {
        toast.success("Meeting created");
        queryClient.invalidateQueries(trpc.rooms.getMeetings.queryOptions({ roomId }));
        setOpen(false);
        setName("");
        router.push(`/meetings/${data.id}`);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <VideoIcon className="size-4" />
          New Meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Room Meeting</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Input
            placeholder="Meeting name (e.g. Daily Standup)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.data?.items.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="size-5" />
                    {agent.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!name.trim() || !agentId || create.isPending}
            onClick={() => create.mutate({ roomId, name, agentId })}
          >
            {create.isPending && <LoaderIcon className="size-4 animate-spin" />}
            Create & Go to Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
