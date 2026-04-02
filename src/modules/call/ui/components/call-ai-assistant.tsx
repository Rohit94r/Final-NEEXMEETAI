"use client";

import { ReactNode, useMemo, useState } from "react";
import { LoaderIcon, SendIcon, SparklesIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTRPC } from "@/trpc/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface Props {
  meetingId: string;
  meetingName: string;
  aiMode: "realtime_voice" | "groq_assistant" | "disabled";
  trigger: ReactNode;
}

const starterPrompts = [
  "Summarize the latest discussion in simple words.",
  "What should our next action items be?",
  "Help me explain this project update professionally.",
];

export const CallAiAssistant = ({
  meetingId,
  meetingName,
  aiMode,
  trigger,
}: Props) => {
  const trpc = useTRPC();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        aiMode === "disabled"
          ? "AI is not configured yet. Add GROQ_API_KEY to enable the in-meeting assistant."
          : `I am ready to help during ${meetingName}. Ask about project doubts, action items, explanations, or meeting follow-ups.`,
    },
  ]);

  const mutation = useMutation(
    trpc.meetings.askLiveAssistant.mutationOptions({
      onSuccess: (data, variables) => {
        setMessages((current) => [
          ...current,
          { role: "user", content: variables.prompt },
          { role: "assistant", content: data.answer },
        ]);
        setPrompt("");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .slice(-6),
    [messages],
  );

  const sendPrompt = async (nextPrompt?: string) => {
    const value = (nextPrompt ?? prompt).trim();

    if (!value || mutation.isPending || aiMode === "disabled") {
      return;
    }

    await mutation.mutateAsync({
      meetingId,
      prompt: value,
      history,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <SparklesIcon className="size-4" />
            Ask AI
          </SheetTitle>
          <SheetDescription>
            Ask project or meeting-related doubts and get a quick professional answer during the call.
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            {starterPrompts.map((starterPrompt) => (
              <Button
                key={starterPrompt}
                type="button"
                variant="outline"
                size="sm"
                disabled={mutation.isPending || aiMode === "disabled"}
                onClick={() => void sendPrompt(starterPrompt)}
              >
                {starterPrompt}
              </Button>
            ))}
          </div>
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-3 pb-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "assistant"
                      ? "max-w-[90%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm"
                      : "ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-sidebar-accent px-4 py-3 text-sm text-sidebar-accent-foreground"
                  }
                >
                  {message.content}
                </div>
              ))}
              {mutation.isPending ? (
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <LoaderIcon className="size-4 animate-spin" />
                    Thinking...
                  </span>
                </div>
              ) : null}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask about the project, meeting decisions, blockers, or next steps..."
              rows={4}
              disabled={aiMode === "disabled" || mutation.isPending}
            />
            <Button
              type="button"
              className="mt-3 w-full"
              disabled={aiMode === "disabled" || mutation.isPending || prompt.trim().length < 2}
              onClick={() => void sendPrompt()}
            >
              {mutation.isPending ? <LoaderIcon className="animate-spin" /> : <SendIcon />}
              Send question
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
