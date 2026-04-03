"use client";

import { useState } from "react";
import { HashIcon, MessageSquareIcon, XIcon } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { ChannelsSidebar } from "./channels-sidebar";
import { ChatWindow } from "./chat-window";
import { ThreadPanel } from "./thread-panel";

interface Props {
  roomId: string;
}

export const PulsePanel = ({ roomId }: Props) => {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<string | null>(null);

  return (
    <div className="flex bg-white rounded-xl border overflow-hidden shadow-sm h-[600px]">
      {/* LEFT: Channels list */}
      <div className="w-64 border-r bg-muted/10 shrink-0">
        <ChannelsSidebar 
          roomId={roomId} 
          activeId={activeChannelId} 
          onSelect={(id: string) => {
            setActiveChannelId(id);
            setActiveThreadMessageId(null); // Close thread when switching channel
          }} 
        />
      </div>

      {/* CENTER: Chat messages */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeChannelId ? (
          <ChatWindow 
            channelId={activeChannelId} 
            onOpenThread={(msgId: string) => setActiveThreadMessageId(msgId)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="p-4 rounded-full bg-primary/5">
              <HashIcon className="size-8 text-primary/40" />
            </div>
            <div>
              <p className="font-medium text-lg">Communication Context</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Select a channel to start communicating with your team around meetings and tasks.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Thread panel (Optional) */}
      {activeThreadMessageId && (
        <div className="w-80 border-l bg-muted/5 shrink-0 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <MessageSquareIcon className="size-4" />
              Thread
            </div>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setActiveThreadMessageId(null)}>
              <XIcon className="size-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <ThreadPanel 
              messageId={activeThreadMessageId} 
              onClose={() => setActiveThreadMessageId(null)}
            />
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
