"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UsersIcon,
  CopyIcon,
  VideoIcon,
  CheckSquareIcon,
  LightbulbIcon,
  UserPlusIcon,
  LogOutIcon,
  TrashIcon,
  ChevronRightIcon,
  LoaderIcon,
  LockIcon,
  GlobeIcon,
} from "lucide-react";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { TasksPanel } from "@/modules/workspace/ui/components/tasks-panel";
import { DecisionsPanel } from "@/modules/workspace/ui/components/decisions-panel";
import { RoomMeetingDialog } from "../components/room-meeting-dialog";
import { isToday } from "date-fns";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

interface Props {
  roomId: string;
}

export const RoomIdView = ({ roomId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: room, isPending } = useQuery(trpc.rooms.getOne.queryOptions({ id: roomId }));
  const { data: roomMeetings } = useQuery(trpc.rooms.getMeetings.queryOptions({ roomId }));

  const invalidateRoom = () => queryClient.invalidateQueries(trpc.rooms.getOne.queryOptions({ id: roomId }));

  const inviteMember = useMutation(
    trpc.rooms.inviteMember.mutationOptions({
      onSuccess: () => { toast.success("Member invited"); invalidateRoom(); setInviteOpen(false); setInviteEmail(""); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const removeMember = useMutation(
    trpc.rooms.removeMember.mutationOptions({
      onSuccess: () => { toast.success("Member removed"); invalidateRoom(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const leaveRoom = useMutation(
    trpc.rooms.leaveRoom.mutationOptions({
      onSuccess: () => { toast.success("Left room"); router.push("/rooms"); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const deleteRoom = useMutation(
    trpc.rooms.remove.mutationOptions({
      onSuccess: () => { toast.success("Room deleted"); router.push("/rooms"); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.inviteCode);
    toast.success("Invite code copied");
  };

  if (isPending) {
    return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading room...</div>;
  }

  if (!room) {
    return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Room not found</div>;
  }

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium text-xl">
                <Link href="/rooms">Rooms</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
              <ChevronRightIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                <Link href={`/rooms/${roomId}`}>{room.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="font-mono tracking-wider px-3 py-1.5">
            {room.inviteCode}
          </Badge>
          <Button size="sm" variant="outline" onClick={copyCode}>
            <CopyIcon className="size-4" />Copy Code
          </Button>
          <Badge variant="outline">
            {room.isPrivate ? <><LockIcon className="size-3 mr-1" />Private</> : <><GlobeIcon className="size-3 mr-1" />Public</>}
          </Badge>
          {room.isOwner ? (
            <>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><UserPlusIcon className="size-4" />Invite</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-3 pt-2">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button
                      disabled={!inviteEmail.trim() || inviteMember.isPending}
                      onClick={() => inviteMember.mutate({ roomId, email: inviteEmail })}
                    >
                      {inviteMember.isPending && <LoaderIcon className="size-4 animate-spin" />}
                      Send Invite
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => deleteRoom.mutate({ id: roomId })}
              >
                <TrashIcon className="size-4" />Delete
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => leaveRoom.mutate({ roomId })}
            >
              <LogOutIcon className="size-4" />Leave
            </Button>
          )}
        </div>
      </div>

      {room.description && (
        <p className="text-sm text-muted-foreground">{room.description}</p>
      )}

      {/* Tabs */}
      <Tabs defaultValue="meetings">
        <div className="bg-white rounded-lg border px-3">
          <TabsList className="p-0 bg-background justify-start rounded-none h-13">
            {[
              { value: "meetings", icon: VideoIcon, label: "Meetings" },
              { value: "tasks", icon: CheckSquareIcon, label: "Tasks" },
              { value: "decisions", icon: LightbulbIcon, label: "Decisions" },
              { value: "members", icon: UsersIcon, label: "Members" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
              >
                <tab.icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Meetings tab */}
        <TabsContent value="meetings" className="mt-4">
          <div className="flex flex-col gap-4">
            {/* Today's meetings */}
            {(() => {
              const todayMeetings = (roomMeetings ?? []).filter(
                (m) => isToday(new Date(m.createdAt)) || m.status === "upcoming" || m.status === "active",
              );
              return todayMeetings.length > 0 ? (
                <div className="rounded-lg border bg-emerald-50 border-emerald-200">
                  <div className="px-4 py-3 border-b border-emerald-200">
                    <p className="text-sm font-semibold text-emerald-800">Today / Active</p>
                  </div>
                  <div className="divide-y divide-emerald-100">
                    {todayMeetings.map((meeting) => (
                      <Link
                        key={meeting.id}
                        href={`/meetings/${meeting.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-emerald-100/60 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{meeting.name}</p>
                          <p className="text-xs text-emerald-700">
                            {format(new Date(meeting.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-xs ${statusColors[meeting.status] ?? ""}`}>
                            {meeting.status}
                          </Badge>
                          {(meeting.status === "upcoming" || meeting.status === "active") && (
                            <Button asChild size="sm" className="h-7 text-xs">
                              <Link href={`/call/${meeting.id}`}>Join</Link>
                            </Button>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* All room meetings */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="font-medium text-sm">All Meetings</p>
                {room.isOwner && (
                  <RoomMeetingDialog
                    roomId={roomId}
                    defaultAgentId={room.defaultAgent?.id}
                  />
                )}
              </div>
              <div className="divide-y">
                {!roomMeetings || roomMeetings.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No meetings yet.{room.isOwner ? " Click New Meeting to start one." : " Wait for the admin to start a meeting."}
                  </div>
                ) : (
                  roomMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/meetings/${meeting.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{meeting.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(meeting.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${statusColors[meeting.status] ?? ""}`}>
                        {meeting.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tasks tab */}
        <TabsContent value="tasks" className="mt-4">
          <div className="rounded-lg border bg-white px-4 py-5">
            <TasksPanel roomId={roomId} />
          </div>
        </TabsContent>

        {/* Decisions tab */}
        <TabsContent value="decisions" className="mt-4">
          <div className="rounded-lg border bg-white px-4 py-5">
            <DecisionsPanel roomId={roomId} />
          </div>
        </TabsContent>

        {/* Members tab */}
        <TabsContent value="members" className="mt-4">
          <div className="rounded-lg border bg-white divide-y">
            {room.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {member.image ? (
                    <Avatar className="size-8">
                      <AvatarImage src={member.image} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <GeneratedAvatar seed={member.name} variant="initials" className="size-8" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                  {room.isOwner && member.role !== "admin" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => removeMember.mutate({ roomId, memberUserId: member.id })}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
