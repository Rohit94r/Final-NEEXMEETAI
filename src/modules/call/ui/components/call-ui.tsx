import { useState } from "react";
import { toast } from "sonner";
import { CallingState, StreamTheme, useCall } from "@stream-io/video-react-sdk";

import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingId: string;
  meetingName: string;
  canManage: boolean;
};

export const CallUI = ({ meetingId, meetingName, canManage }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleJoin = async () => {
    if (!call || isJoining) return;

    if (call.state.callingState !== CallingState.IDLE) {
      setShow("call");
      return;
    }

    try {
      setIsJoining(true);
      await call.join();
      setShow("call");
    } catch (error) {
      console.error("Failed to join call", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to join call",
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!call || isLeaving) return;

    try {
      setIsLeaving(true);

      if (canManage) {
        await call.endCall();
      } else {
        await call.leave();
      }

      setShow("ended");
    } catch (error) {
      console.error("Failed to leave call", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to leave call",
      );
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} isJoining={isJoining} />}
      {show === "call" && (
        <CallActive
          meetingId={meetingId}
          meetingName={meetingName}
          canManage={canManage}
          onLeave={handleLeave}
          isLeaving={isLeaving}
        />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  )
};
