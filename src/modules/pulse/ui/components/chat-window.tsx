"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SendIcon, LoaderIcon, MessageCircleIcon, CalendarIcon, CheckSquareIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { GeneratedAvatar } from "@/components/shared/generated-avatar";
import { Badge } from "@/components/ui/badge";

interface Props {
  channelId: string;
  onOpenThread: (messageId: string) => void;
}

export const ChatWindow = ({ channelId, onOpenThread }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  const { data: messages, isPending } = useQuery({
    ...trpc.pulse.getByChannel.queryOptions({ channelId }),
    refetchInterval: 3000, // Simple real-time feel
    staleTime: 5000,
  });

  const send = useMutation(
    trpc.pulse.sendMessage.mutationOptions({
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries(trpc.pulse.getByChannel.queryOptions({ channelId }));
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || send.isPending) return;
    send.mutate({ channelId, content: content.trim() });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="flex flex-col gap-y-6">
          {isPending ? (
             <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground animate-pulse">
                Loading messages...
             </div>
          ) : messages?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="p-4 rounded-full bg-primary/5 text-primary/30">
                 <MessageCircleIcon className="size-10" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Start the productivity pulse! Be the first to message.</p>
            </div>
          ) : (
            messages?.map((msg) => (
              <div key={msg.id} className="flex gap-3 group">
                <GeneratedAvatar seed={msg.user.name} variant="initials" className="size-8 mt-0.5" />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{msg.user.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  
                  {/* Context Links */}
                  {(msg.meetingId || msg.taskId) && (
                     <div className="flex gap-2 mt-1">
                        {msg.meetingId && (
                           <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-blue-50 text-blue-700 border-blue-100 font-medium">
                              <CalendarIcon className="size-3" />
                              Meeting Link
                           </Badge>
                        )}
                        {msg.taskId && (
                           <Badge variant="secondary" className="text-[10px] h-5 gap-1 bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">
                              <CheckSquareIcon className="size-3" />
                              Linked Task
                           </Badge>
                        )}
                     </div>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 h-7 text-[10px] font-medium opacity-0 group-hover:opacity-100 w-fit transition-opacity gap-1"
                    onClick={() => onOpenThread(msg.id)}
                  >
                    Reply in thread
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="Type a message... (use # for context)" 
            className="flex-1 bg-muted/20 border-none h-11 pr-12 focus-visible:ring-1 focus-visible:ring-primary/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1 size-9 rounded-md transition-all active:scale-95" 
            disabled={!content.trim() || send.isPending}
            onClick={handleSend}
          >
            {send.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2 px-1 text-center font-medium">
          Integrated with your workspace context. Messages bridge work and talk.
        </p>
      </div>
    </div>
  );
};
