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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((room) => (
            <div
              key={room.id}
              className="rounded-xl border bg-white flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Card top — clickable */}
              <Link href={`/rooms/${room.id}`} className="flex flex-col gap-3 px-5 pt-5 pb-4 flex-1">
                {/* Icon + name row */}
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-sidebar-accent/40 p-3 shrink-0">
                    <UsersIcon className="size-5 text-sidebar-accent-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {room.isStarred && (
                        <StarIcon className="size-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      )}
                      <p className="font-semibold text-base truncate">{room.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {room.isPrivate ? "Private room" : "Public room"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {room.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">No description</p>
                )}
              </Link>

              {/* Card footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20 rounded-b-xl">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs gap-1">
                    {room.isPrivate
                      ? <><LockIcon className="size-3" />Private</>
                      : <><GlobeIcon className="size-3" />Public</>
                    }
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon className="size-3" />
                    {format(new Date(room.createdAt), "MMM d")}
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
