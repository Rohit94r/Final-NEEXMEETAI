import Link from "next/link";
import Image from "next/image";
import { LinkIcon } from "lucide-react";
import {
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

import { Button } from "@/components/ui/button";
import { useMeetingShare } from "@/hooks/use-meeting-share";

interface Props {
  meetingId: string;
  meetingName: string;
  canManage: boolean;
  onLeave: () => void;
  isLeaving: boolean;
};

export const CallActive = ({
  meetingId,
  meetingName,
  canManage,
  onLeave,
  isLeaving,
}: Props) => {
  const handleShare = useMeetingShare(meetingId);

  return (
    <div className="flex flex-col justify-between p-4 h-full text-white">
      <div className="bg-[#101213] rounded-3xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
            <Image
              src="/logo.svg"
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
            <p className="text-sm text-white/60">
              {canManage ? "Host controls enabled" : "You joined via shared link"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleShare}>
            <LinkIcon />
            Share link
          </Button>
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
