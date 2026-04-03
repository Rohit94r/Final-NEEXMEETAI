"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderIcon, VideoIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// returns today's date as YYYY-MM-DD for the date input min
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// returns current time rounded up to next 30 min as HH:MM
function nextHalfHour() {
  const now = new Date();
  const mins = now.getMinutes();
  const rounded = mins < 30 ? 30 : 60;
  now.setMinutes(rounded, 0, 0);
  return now.toTimeString().slice(0, 5);
}

export const RoomMeetingDialog = ({ roomId, defaultAgentId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [agentId, setAgentId] = useState(defaultAgentId ?? "");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(nextHalfHour());

  const agents = useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100 }));

  const create = useMutation(
    trpc.rooms.createMeeting.mutationOptions({
      onSuccess: () => {
        toast.success("Meeting scheduled — members will be notified");
        queryClient.invalidateQueries(trpc.rooms.getMeetings.queryOptions({ roomId }));
        setOpen(false);
        setName("");
        setTopic("");
        setDate(todayStr());
        setTime(nextHalfHour());
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const scheduledAt = date && time ? new Date(`${date}T${time}`).toISOString() : "";
  const isValid = name.trim() && agentId && date && time;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <VideoIcon className="size-4" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Room Meeting</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Meeting Name *</label>
            <Input
              placeholder="e.g. Daily Standup"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic / Agenda</label>
            <Textarea
              placeholder="What will be discussed? (optional)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
              <Input
                type="date"
                value={date}
                min={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time *</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">AI Agent *</label>
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
          </div>

          <Button
            disabled={!isValid || create.isPending}
            onClick={() => create.mutate({ roomId, name, agentId, topic: topic || null, scheduledAt })}
            className="mt-1"
          >
            {create.isPending && <LoaderIcon className="size-4 animate-spin" />}
            Schedule & Notify Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
