"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon, SendIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedAvatar } from "@/components/generated-avatar";

interface Props {
  messageId: string;
  onClose: () => void;
}

export const ThreadPanel = ({ messageId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  const { data: threadMessages, isPending } = useQuery({
    ...trpc.pulse.getByMessage.queryOptions({ messageId }),
    refetchInterval: 3000,
  });

  const reply = useMutation(
    trpc.pulse.reply.mutationOptions({
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries(trpc.pulse.getByMessage.queryOptions({ messageId }));
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadMessages]);

  const handleReply = () => {
    if (!content.trim() || reply.isPending) return;
    reply.mutate({ messageId, content: content.trim() });
  };

  return (
    <div className="flex flex-col h-[calc(100%-60px)]">
      <div className="flex-1 p-4 bg-muted/5 min-h-0" ref={scrollRef}>
        <div className="flex flex-col gap-y-4">
          {isPending ? (
            <div className="flex items-center justify-center py-10 animate-pulse text-xs text-muted-foreground">
               Loading thread...
            </div>
          ) : threadMessages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-40">
               <MessageCircleIcon className="size-6" />
               <p className="text-[10px] font-medium">No replies yet.</p>
            </div>
          ) : (
            threadMessages?.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <GeneratedAvatar seed={reply.user.name} variant="initials" className="size-6 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{reply.user.name}</span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(reply.createdAt), "h:mm a")}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-normal break-words mt-0.5">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-3 border-t bg-white">
        <div className="flex gap-2 relative">
          <Input 
            placeholder="Reply..." 
            className="flex-1 bg-muted/20 border-none h-10 text-xs pr-10 focus-visible:ring-1 focus-visible:ring-primary/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <Button 
            size="icon" 
            className="absolute right-0.5 top-0.5 size-9 transition-all active:scale-95" 
            disabled={!content.trim() || reply.isPending}
            onClick={handleReply}
          >
            {reply.isPending ? <LoaderIcon className="size-3 animate-spin" /> : <SendIcon className="size-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
