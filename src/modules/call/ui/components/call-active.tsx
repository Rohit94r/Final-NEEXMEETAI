import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LinkIcon, MessageCircleIcon, SendIcon, SparklesIcon, XIcon } from "lucide-react";
import {
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CallJoinRequests } from "./call-join-requests";
import { CallSharePanel } from "./call-share-panel";
import { CallAiAssistant } from "./call-ai-assistant";

interface Props {
  meetingId: string;
  meetingName: string;
  meetingCode: string;
  canManage: boolean;
  aiMode: "realtime_voice" | "groq_assistant" | "disabled";
  onLeave: () => void;
  isLeaving: boolean;
};

type ChatMessage = {
  id: number;
  sender: string;
  text: string;
  isOwn?: boolean;
};

const initialChatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "NeexMeet AI",
    text: "Chat is open for anyone who prefers typing instead of speaking.",
  },
];

export const CallActive = ({
  meetingId,
  meetingName,
  meetingCode,
  canManage,
  aiMode,
  onLeave,
  isLeaving,
}: Props) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const sendChatMessage = () => {
    const value = chatInput.trim();

    if (!value) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "You",
        text: value,
        isOwn: true,
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="relative flex h-full flex-col justify-between p-3 text-white md:p-4">
      {/* Top Bar - Fixed at top */}
      <div className="bg-[#101213] rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left Section - Logo & Meeting Info */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {/* Logo with better visibility */}
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
          >
            <Image
              src="/logo.png"
              width={24}
              height={24}
              alt="NeexMeet"
              className="h-6 w-6 md:h-7 md:w-7 object-contain"
              priority
            />
          </Link>
          {/* Meeting Info */}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm md:text-base font-medium truncate">
              {meetingName}
            </h4>
            <div className="mt-0.5 md:mt-1 flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/60">
              <span className="hidden sm:inline">{canManage ? "Host controls enabled" : "Live participant view"}</span>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80 text-xs px-1.5 py-0">
                {meetingCode}
              </Badge>
            </div>
          </div>
        </div>
        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {canManage ? <CallJoinRequests meetingId={meetingId} /> : null}
          <CallAiAssistant
            meetingId={meetingId}
            meetingName={meetingName}
            aiMode={aiMode}
            trigger={
              <Button 
                type="button" 
                size="sm"
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white h-9 px-3"
              >
                <SparklesIcon className="size-4" />
                <span className="hidden sm:inline ml-1.5">Ask AI</span>
              </Button>
            }
          />
          <CallSharePanel
            meetingId={meetingId}
            meetingCode={meetingCode}
            meetingName={meetingName}
            trigger={
              <Button 
                type="button"
                size="sm"
                className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white h-9 px-3"
              >
                <LinkIcon className="size-4" />
                <span className="hidden sm:inline ml-1.5">Share</span>
              </Button>
            }
          />
        </div>
      </div>
      {/* Main Video Area */}
      <div className="flex-1 min-h-0 py-3 md:py-4">
        <SpeakerLayout />
      </div>
      {/* Bottom Corner Chat */}
     < div className="absolute bottom-24 right-3 z-20 flex flex-col items-end gap-3 md:bottom-28 md:right-5">
        {chatOpen ? (
          <div className="w-[calc(100vw-24px)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#101213]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Meeting chat</p>
                <p className="text-xs text-white/45">Type if you are not comfortable speaking</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setChatOpen(false)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={message.isOwn ? "ml-auto max-w-[86%] text-right" : "max-w-[86%]"}
                >
                  <p className="mb-1 text-[11px] text-white/40">{message.sender}</p>
                  <div
                    className={
                      message.isOwn
                        ? "rounded-2xl rounded-br-md bg-emerald-300 px-3 py-2 text-sm text-black"
                        : "rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-sm text-white/80"
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-white/10 p-3">
              <Input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendChatMessage();
                  }
                }}
                placeholder="Type a message..."
                className="h-10 border-white/10 bg-white/5 text-white placeholder:text-white/35"
              />
              <Button
                type="button"
                size="icon"
                className="size-10 shrink-0 bg-emerald-300 text-black hover:bg-emerald-200"
                onClick={sendChatMessage}
              >
                <SendIcon className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}

        <Button
          type="button"
          className="h-11 rounded-full border border-emerald-300/30 bg-emerald-300/15 px-4 text-emerald-50 shadow-[0_0_30px_rgba(16,185,129,0.22)] backdrop-blur-xl hover:bg-emerald-300/25 hover:text-white"
          onClick={() => setChatOpen((current) => !current)}
        >
          <MessageCircleIcon className="size-4" />
          <span>Chat</span>
          {chatMessages.length > 1 ? (
            <span className="ml-1 rounded-full bg-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold text-black">
              {chatMessages.length - 1}
            </span>
          ) : null}
        </Button>
      </>
      {/* Bottom Controls */}
      <div className="bg-[#101213] rounded-full px-2 md:px-4">
        <CallControls onLeave={onLeave} />
        {isLeaving ? (
          <p className="pb-3 text-center text-xs text-white/60">
            {canManage ? "Ending the meeting..." : "Leaving the meeting..."}
          </p>
        ) : null}
      </div>
    </div>
  );
};
