"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PlusIcon,
  LogInIcon,
  UsersIcon,
  LockIcon,
  GlobeIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  LoaderIcon,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateRoomDialog } from "../components/create-room-dialog";
import { JoinRoomDialog } from "../components/join-room-dialog";

export const RoomsView = () => {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const { data: roomsList, isPending } = useQuery(trpc.rooms.getMany.queryOptions());

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameId, setRenameId] = useState("");
  const [renameName, setRenameName] = useState("");

  const invalidate = () => queryClient.invalidateQueries(trpc.rooms.getMany.queryOptions());

  const rename = useMutation(
    trpc.rooms.rename.mutationOptions({
      onSuccess: () => { toast.success("Room renamed"); invalidate(); setRenameOpen(false); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const remove = useMutation(
    trpc.rooms.remove.mutationOptions({
      onSuccess: () => { toast.success("Room deleted"); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const toggleStar = useMutation(
    trpc.rooms.toggleStar.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (e) => toast.error(e.message),
    }),
  );

  const openRename = (id: string, currentName: string) => {
    setRenameId(id);
    setRenameName(currentName);
    setRenameOpen(true);
  };

  // starred first, then by date
  const sorted = [...(roomsList ?? [])].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Persistent team spaces — meetings, tasks, and decisions in one place
          </p>
        </div>
        <div className="flex gap-2">
          <JoinRoomDialog
            trigger={
              <Button variant="outline">
                <LogInIcon className="size-4" />
                Join Room
              </Button>
            }
          />
          <CreateRoomDialog
            trigger={
              <Button>
                <PlusIcon className="size-4" />
                New Room
              </Button>
            }
          />
        </div>
      </div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Room</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              placeholder="Room name"
            />
            <Button
              disabled={!renameName.trim() || rename.isPending}
              onClick={() => rename.mutate({ id: renameId, name: renameName.trim() })}
            >
              {rename.isPending && <LoaderIcon className="size-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content */}
      {isPending ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading rooms...</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-lg border bg-white px-4 py-16 text-center">
          <UsersIcon className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No rooms yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a room for your team or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map((room) => (
            <div
              key={room.id}
              className="rounded-2xl border-2 bg-white flex flex-col hover:shadow-xl hover:border-primary/20 transition-all duration-300 min-h-[220px]"
            >
              {/* Card top — clickable */}
              <Link href={`/rooms/${room.id}`} className="flex flex-col gap-4 px-6 pt-6 pb-5 flex-1">
                {/* Icon + name row */}
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/5 p-4 shrink-0 shadow-sm border border-primary/10">
                    <UsersIcon className="size-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-start gap-2 flex-wrap">
                      {room.isStarred && (
                        <StarIcon className="size-4 fill-amber-400 text-amber-400 shrink-0 mt-1" />
                      )}
                      <h3 className="font-bold text-xl leading-tight text-foreground break-words">
                        {room.name}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1.5 opacity-70">
                      {room.isPrivate ? "Private space" : "Public space"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {room.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {room.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/40 italic">No description provided</p>
                )}
              </Link>

              {/* Card footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50 rounded-b-2xl">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white border">
                    {room.isPrivate
                      ? <><LockIcon className="size-3 mr-1" />Private</>
                      : <><GlobeIcon className="size-3 mr-1" />Public</>
                    }
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CalendarIcon className="size-3.5 opacity-60" />
                    {format(new Date(room.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                {/* Three-dot menu — only for owner */}
                {room.ownerId === session?.user?.id && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={(e) => { e.preventDefault(); toggleStar.mutate({ id: room.id, isStarred: !room.isStarred }); }}
                      >
                        <StarIcon className={`size-4 ${room.isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                        {room.isStarred ? "Unstar" : "Star"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.preventDefault(); openRename(room.id, room.name); }}
                      >
                        <PencilIcon className="size-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={(e) => { e.preventDefault(); remove.mutate({ id: room.id }); }}
                      >
                        <TrashIcon className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
