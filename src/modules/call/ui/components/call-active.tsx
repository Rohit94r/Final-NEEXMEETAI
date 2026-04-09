import Link from "next/link";
import Image from "next/image";
import { LinkIcon, SparklesIcon } from "lucide-react";
import {
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export const CallActive = ({
  meetingId,
  meetingName,
  meetingCode,
  canManage,
  aiMode,
  onLeave,
  isLeaving,
}: Props) => {
  return (
    <div className="flex flex-col justify-between p-3 md:p-4 h-full text-white">
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
