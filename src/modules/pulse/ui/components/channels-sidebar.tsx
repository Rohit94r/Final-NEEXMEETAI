"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HashIcon, PlusIcon, LoaderIcon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  roomId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const ChannelsSidebar = ({ roomId, activeId, onSelect }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [newChannelOpen, setNewChannelOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: channels, isPending } = useQuery(trpc.pulse.getByRoom.queryOptions({ roomId }));

  const create = useMutation(
    trpc.pulse.createChannel.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Channel ${data.name} created`);
        queryClient.invalidateQueries(trpc.pulse.getByRoom.queryOptions({ roomId }));
        setNewChannelOpen(false);
        setNewName("");
        onSelect(data.id);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
          CHANNELS
        </h3>
        
        <Dialog open={newChannelOpen} onOpenChange={setNewChannelOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground/60 hover:text-primary">
              <PlusIcon className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-2">
              <Input 
                placeholder="#e.g. brainstorming" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
              />
              <Button 
                disabled={!newName.trim() || create.isPending}
                onClick={() => create.mutate({ roomId, name: newName.trim() })}
              >
                {create.isPending && <LoaderIcon className="size-4 animate-spin" />}
                Create Channel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-y-0.5">
          {isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))
          ) : (
            channels?.map((channel) => (
              <Button
                key={channel.id}
                variant={activeId === channel.id ? "secondary" : "ghost"}
                size="sm"
                className={`justify-start gap-2 h-8 px-2 font-medium ${
                  activeId === channel.id ? "bg-primary/10 text-primary" : "text-muted-foreground/80"
                }`}
                onClick={() => onSelect(channel.id)}
              >
                <HashIcon className="size-4" />
                <span className="truncate">{channel.name}</span>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
      
      <div className="mt-auto px-4 pt-4 border-t border-muted/20">
         <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-muted-foreground/60">
           <SettingsIcon className="size-4" />
           Customize Pulse
         </Button>
      </div>
    </div>
  );
};
