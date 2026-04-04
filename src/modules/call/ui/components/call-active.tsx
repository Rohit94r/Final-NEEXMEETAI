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
    <div className="flex flex-col justify-between p-4 h-full text-white">
      <div className="bg-[#101213] rounded-3xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
            <Image
              src="/logo.png"
              width={22}
              height={22}
              alt="Logo"
              className="h-auto w-auto"
            />
          </Link>
          <div className="min-w-0">
            <h4 className="text-base truncate">
              {meetingName}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-white/60">
              <span>{canManage ? "Host controls enabled" : "Live participant view"}</span>
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">
                Code {meetingCode}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? <CallJoinRequests meetingId={meetingId} /> : null}
          <CallAiAssistant
            meetingId={meetingId}
            meetingName={meetingName}
            aiMode={aiMode}
            trigger={
              <Button type="button" className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <SparklesIcon />
                Ask AI
              </Button>
            }
          />
          <CallSharePanel
            meetingId={meetingId}
            meetingCode={meetingCode}
            meetingName={meetingName}
            trigger={
              <Button type="button" className="border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <LinkIcon />
                Share
              </Button>
            }
          />
        </div>
      </div>
      <SpeakerLayout />
      <div className="bg-[#101213] rounded-full px-4">
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
