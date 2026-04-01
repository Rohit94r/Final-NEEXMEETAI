import { useState } from "react";
import { toast } from "sonner";
import { CallingState, StreamTheme, useCall } from "@stream-io/video-react-sdk";

import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingName: string;
};

export const CallUI = ({ meetingName }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [isJoining, setIsJoining] = useState(false);

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

  const handleLeave = () => {
    if (!call) return;

    call.endCall();
    setShow("ended");
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} isJoining={isJoining} />}
      {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  )
};
