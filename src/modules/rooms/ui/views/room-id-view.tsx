"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UsersIcon, CopyIcon, VideoIcon, CheckSquareIcon, LightbulbIcon,
  UserPlusIcon, LogOutIcon, TrashIcon, ChevronRightIcon, LoaderIcon,
  LockIcon, GlobeIcon, MoreVerticalIcon, PencilIcon, StarIcon,
  CalendarIcon, ClockIcon, ActivityIcon, FingerprintIcon,
} from "lucide-react";
import { format, isToday, isFuture, isSameDay } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { TasksPanel } from "@/modules/workspace/ui/components/tasks-panel";
import { DecisionsPanel } from "@/modules/workspace/ui/components/decisions-panel";
import { RoomMeetingDialog } from "../components/room-meeting-dialog";
import { UpdateMeetingDialog } from "@/modules/meetings/ui/components/update-meeting-dialog";
import { PulsePanel } from "@/modules/pulse/ui/components/pulse-panel";
import { PresencePanel } from "@/modules/presence/ui/components/presence-panel";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  upcoming:   { label: "Scheduled",  color: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-400" },
  active:     { label: "Live Now",   color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  completed:  { label: "Completed",  color: "bg-gray-100 text-gray-600 border-gray-200",       dot: "bg-gray-400" },
  processing: { label: "Processing", color: "bg-amber-50 text-amber-700 border-amber-200",     dot: "bg-amber-400" },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-600 border-red-200",           dot: "bg-red-400" },
};

interface Props { roomId: string; }

export const RoomIdView = ({ roomId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updateMeetingOpen, setUpdateMeetingOpen] = useState(false);
  const [meetingToUpdate, setMeetingToUpdate] = useState<any>(null);

  const [ConfirmDelete, confirmDelete] = useConfirm(
    "Delete Meeting?",
    "This will permanently delete this meeting and all its data."
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries(trpc.rooms.getMeetings.queryOptions({ roomId }));
  };

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: () => {
        toast.success("Meeting deleted");
        invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const onDeleteMeeting = async (id: string) => {
    const confirmed = await confirmDelete();
    if (confirmed) {
      removeMeeting.mutate({ id });
    }
  };

  const onEditMeeting = (meeting: any) => {
    setMeetingToUpdate(meeting);
    setUpdateMeetingOpen(true);
  };
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");

  const { data: room, isPending } = useQuery(trpc.rooms.getOne.queryOptions({ id: roomId }));
  const { data: roomMeetings } = useQuery({
    ...trpc.rooms.getMeetings.queryOptions({ roomId }),
    refetchInterval: 30000,
  });

  const invalidateRoom  = () => queryClient.invalidateQueries(trpc.rooms.getOne.queryOptions({ id: roomId }));
  const invalidateRooms = () => queryClient.invalidateQueries(trpc.rooms.getMany.queryOptions());

  const inviteMember = useMutation(trpc.rooms.inviteMember.mutationOptions({
    onSuccess: () => { toast.success("Member invited"); invalidateRoom(); setInviteOpen(false); setInviteEmail(""); },
    onError: (e) => toast.error(e.message),
  }));
  const removeMember = useMutation(trpc.rooms.removeMember.mutationOptions({
    onSuccess: () => { toast.success("Member removed"); invalidateRoom(); },
    onError: (e) => toast.error(e.message),
  }));
  const leaveRoom = useMutation(trpc.rooms.leaveRoom.mutationOptions({
    onSuccess: () => { toast.success("Left room"); router.push("/rooms"); },
    onError: (e) => toast.error(e.message),
  }));
  const deleteRoom = useMutation(trpc.rooms.remove.mutationOptions({
    onSuccess: () => { toast.success("Room deleted"); router.push("/rooms"); },
    onError: (e) => toast.error(e.message),
  }));
  const renameRoom = useMutation(trpc.rooms.rename.mutationOptions({
    onSuccess: () => { toast.success("Room renamed"); invalidateRoom(); invalidateRooms(); setRenameOpen(false); },
    onError: (e) => toast.error(e.message),
  }));
  const toggleStar = useMutation(trpc.rooms.toggleStar.mutationOptions({
    onSuccess: () => { invalidateRoom(); invalidateRooms(); },
    onError: (e) => toast.error(e.message),
  }));

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.inviteCode);
    toast.success("Invite code copied");
  };

  if (isPending) return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading room...</div>;
  if (!room)     return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Room not found</div>;

  const allMeetings      = roomMeetings ?? [];
  const todayMeetings    = allMeetings.filter((m) => m.scheduledAt && isToday(new Date(m.scheduledAt)));
  const upcomingMeetings = allMeetings.filter((m) => m.scheduledAt && isFuture(new Date(m.scheduledAt)) && !isToday(new Date(m.scheduledAt)));
  const pastMeetings     = allMeetings.filter((m) => !m.scheduledAt || (!isToday(new Date(m.scheduledAt)) && !isFuture(new Date(m.scheduledAt))));

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 overflow-y-auto">

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Room</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="Room name" />
            <Button disabled={!renameName.trim() || renameRoom.isPending}
              onClick={() => renameRoom.mutate({ id: roomId, name: renameName.trim() })}>
              {renameRoom.isPending && <LoaderIcon className="size-4 animate-spin" />}Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <Link href={`/rooms/${roomId}`}>
                  <span className="flex items-center gap-1.5">
                    {room.isStarred && <StarIcon className="size-4 fill-amber-400 text-amber-400" />}
                    {room.name}
                  </span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2 flex-wrap">
          {room.isOwner && (
            <>
              <Badge variant="outline" className="font-mono tracking-wider px-3 py-1.5">{room.inviteCode}</Badge>
              <Button size="sm" variant="outline" onClick={copyCode}><CopyIcon className="size-4" />Copy Code</Button>
            </>
          )}
          <Badge variant="outline">
            {room.isPrivate ? <><LockIcon className="size-3 mr-1" />Private</> : <><GlobeIcon className="size-3 mr-1" />Public</>}
          </Badge>

          {room.isOwner && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><UserPlusIcon className="size-4" />Invite</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-3 pt-2">
                  <Input placeholder="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  <Button disabled={!inviteEmail.trim() || inviteMember.isPending}
                    onClick={() => inviteMember.mutate({ roomId, email: inviteEmail })}>
                    {inviteMember.isPending && <LoaderIcon className="size-4 animate-spin" />}Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="size-8 p-0">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {room.isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => toggleStar.mutate({ id: roomId, isStarred: !room.isStarred })}>
                    <StarIcon className={`size-4 ${room.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                    {room.isStarred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setRenameName(room.name); setRenameOpen(true); }}>
                    <PencilIcon className="size-4" />Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteRoom.mutate({ id: roomId })}>
                    <TrashIcon className="size-4" />Delete Room
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="text-muted-foreground" onClick={() => leaveRoom.mutate({ roomId })}>
                  <LogOutIcon className="size-4" />Leave Room
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {room.description && <p className="text-sm text-muted-foreground">{room.description}</p>}

      {/* Tabs */}
      <Tabs defaultValue="meetings">
        <div className="bg-white rounded-lg border px-3">
          <TabsList className="p-0 bg-background justify-start rounded-none h-13">
            {[
              { value: "meetings",  icon: VideoIcon,        label: "Meetings" },
              { value: "presence",  icon: FingerprintIcon,  label: "Presence" },
              { value: "tasks",     icon: CheckSquareIcon,  label: "Tasks" },
              { value: "pulse",     icon: ActivityIcon,     label: "Pulse" },
              { value: "decisions", icon: LightbulbIcon,    label: "Decisions" },
              { value: "members",   icon: UsersIcon,        label: "Members" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground">
                <tab.icon className="size-4" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Meetings ─────────────────────────────────────────────────── */}
        <TabsContent value="meetings" className="mt-4">
          <div className="flex flex-col gap-4">

            {/* Today */}
            <div className="rounded-lg border bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <p className="font-medium text-sm">Today — {format(new Date(), "EEEE, MMMM d")}</p>
                </div>
                {room.isOwner && <RoomMeetingDialog roomId={roomId} defaultAgentId={room.defaultAgent?.id} />}
              </div>
              <div className="divide-y">
                {todayMeetings.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarIcon className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {room.isOwner ? "No meetings today. Click Schedule Meeting to add one." : "No meetings scheduled for today."}
                    </p>
                  </div>
                ) : todayMeetings.map((meeting) => {
                  const cfg = statusConfig[meeting.status] ?? statusConfig.upcoming;
                  const isJoinable = meeting.status === "upcoming" || meeting.status === "active";
                  return (
                    <div
                      key={meeting.id}
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                      className="flex items-center justify-between px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-1.5 size-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{meeting.name}</p>
                          {meeting.topic && <p className="text-xs text-muted-foreground mt-0.5 truncate">{meeting.topic}</p>}
                          <div className="flex items-center gap-1.5 mt-1">
                            <ClockIcon className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {meeting.scheduledAt ? format(new Date(meeting.scheduledAt), "h:mm a") : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                        {isJoinable && (
                          <Button
                            asChild
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/call/${meeting.id}`}>Join</Link>
                          </Button>
                        )}
                        
                        {room.isOwner && (
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditMeeting(meeting); }}>
                                <PencilIcon className="size-3.5 mr-2" />
                                Edit / Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => { e.stopPropagation(); onDeleteMeeting(meeting.id); }}
                              >
                                <TrashIcon className="size-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming scheduled */}
            {upcomingMeetings.length > 0 && (
              <div className="rounded-lg border bg-white">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-sm">Upcoming Scheduled</p>
                </div>
                <div className="divide-y">
                  {upcomingMeetings.map((meeting) => {
                    const cfg = statusConfig[meeting.status] ?? statusConfig.upcoming;
                    return (
                      <div
                        key={meeting.id}
                        onClick={() => router.push(`/meetings/${meeting.id}`)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-1.5 size-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{meeting.name}</p>
                            {meeting.topic && <p className="text-xs text-muted-foreground truncate">{meeting.topic}</p>}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CalendarIcon className="size-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {meeting.scheduledAt ? format(new Date(meeting.scheduledAt), "EEE, MMM d · h:mm a") : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                          {room.isOwner && (
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 p-0 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVerticalIcon className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditMeeting(meeting); }}>
                                  <PencilIcon className="size-3.5 mr-2" />
                                  Edit / Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={(e) => { e.stopPropagation(); onDeleteMeeting(meeting.id); }}
                                >
                                  <TrashIcon className="size-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past */}
            {pastMeetings.length > 0 && (
              <div className="rounded-lg border bg-white">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-sm text-muted-foreground">Past Meetings</p>
                </div>
                <div className="divide-y">
                  {pastMeetings.map((meeting) => {
                    const cfg = statusConfig[meeting.status] ?? statusConfig.completed;
                    return (
                      <Link key={meeting.id} href={`/meetings/${meeting.id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-1.5 size-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate text-muted-foreground">{meeting.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(meeting.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-xs shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Presence ─────────────────────────────────────────────────── */}
        <TabsContent value="presence" className="mt-4 outline-none">
          <PresencePanel roomId={roomId} isOwner={room.isOwner} />
        </TabsContent>

        {/* ── Pulse ────────────────────────────────────────────────────── */}
        <TabsContent value="pulse" className="mt-4 outline-none">
          <PulsePanel roomId={roomId} />
        </TabsContent>

        {/* ── Tasks ────────────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="mt-4">
          <div className="rounded-lg border bg-white px-4 py-5">
            <TasksPanel roomId={roomId} />
          </div>
        </TabsContent>

        {/* ── Decisions ────────────────────────────────────────────────── */}
        <TabsContent value="decisions" className="mt-4">
          <div className="rounded-lg border bg-white px-4 py-5">
            <DecisionsPanel roomId={roomId} />
          </div>
        </TabsContent>

        {/* ── Members ──────────────────────────────────────────────────── */}
        <TabsContent value="members" className="mt-4">
          <div className="rounded-lg border bg-white divide-y">
            {room.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {member.image ? (
                    <Avatar className="size-8"><AvatarImage src={member.image} /><AvatarFallback>{member.name.charAt(0)}</AvatarFallback></Avatar>
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
                    <Button size="sm" variant="ghost" className="size-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => removeMember.mutate({ roomId, memberUserId: member.id })}>
                      <TrashIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <ConfirmDelete />
      {meetingToUpdate && (
        <UpdateMeetingDialog
          open={updateMeetingOpen}
          onOpenChange={setUpdateMeetingOpen}
          initialValues={meetingToUpdate}
        />
      )}
    </div>
  );
};
