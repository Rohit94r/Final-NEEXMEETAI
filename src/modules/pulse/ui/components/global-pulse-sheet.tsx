"use client";

import { useQuery } from "@tanstack/react-query";
import { ActivityIcon, MessageSquareIcon, InfoIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PulsePanel } from "./pulse-panel";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  children: React.ReactNode;
}

export const GlobalPulseSheet = ({ children }: Props) => {
  const trpc = useTRPC();
  
  // For global pulse, we find the most recent room the user is in
  const { data: rooms, isPending } = useQuery(trpc.rooms.getMany.queryOptions());
  const mostRecentRoom = rooms?.[0];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col border-l-primary/10">
        <SheetHeader className="p-6 border-b bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ActivityIcon className="size-5" />
             </div>
             <div>
                <SheetTitle className="text-xl">Quick Pulse</SheetTitle>
                <p className="text-sm text-muted-foreground font-normal">
                   Real-time communication across your workspaces
                </p>
             </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 min-h-0 bg-muted/5 p-4 flex flex-col gap-4 overflow-hidden">
           {isPending ? (
              <div className="space-y-4">
                 <Skeleton className="h-[200px] w-full" />
                 <Skeleton className="h-[200px] w-full" />
              </div>
           ) : mostRecentRoom ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden rounded-xl border shadow-sm">
                 <div className="px-4 py-2 bg-white border-b flex items-center justify-between shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                       RECENT ROOM: {mostRecentRoom.name}
                    </p>
                 </div>
                 <div className="flex-1 min-h-0">
                    <PulsePanel roomId={mostRecentRoom.id} />
                 </div>
              </div>
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-60">
                 <div className="p-5 rounded-full bg-muted">
                    <MessageSquareIcon className="size-10 text-muted-foreground" />
                 </div>
                 <div>
                    <p className="font-bold text-lg">No active pulses</p>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">
                       Join or create a room to start communicating with your team.
                    </p>
                 </div>
              </div>
           )}
           
           <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-blue-700">
              <InfoIcon className="size-5 shrink-0" />
              <p className="text-xs leading-relaxed">
                 Quick Pulse shows the communication stream from your most recently active room. Use it for fast syncs and productivity checks.
              </p>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
