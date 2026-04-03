import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CallingState,
  StreamTheme,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingId: string;
  meetingName: string;
  meetingCode: string;
  canManage: boolean;
  aiMode: "realtime_voice" | "groq_assistant" | "disabled";
  autoJoin?: boolean;
};

export const CallUI = ({
  meetingId,
  meetingName,
  meetingCode,
  canManage,
  aiMode,
  autoJoin = false,
}: Props) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const joinInProgress = useCallback(() => isJoining, [isJoining]);

  const handleJoin = useCallback(async () => {
    if (!call || isJoining || joinInProgress()) return;

    // Use current state as source of truth
    const currentState = call.state.callingState;
    if (currentState !== CallingState.IDLE) {
      if (currentState === CallingState.JOINED) {
        setShow("call");
      }
      return;
    }

    try {
      setIsJoining(true);
      await call.join();
      setShow("call");
    } catch (error) {
      console.error("Failed to join call", error);
      // If we're already joined but local state was out of sync, just show the call
      if (error instanceof Error && error.message.includes("shall be called only once")) {
        setShow("call");
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to join call",
        );
      }
    } finally {
      setIsJoining(false);
    }
  }, [call, isJoining, joinInProgress]);

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

  useEffect(() => {
    if (!autoJoin || !call || isJoining || show !== "lobby") {
      return;
    }

    void handleJoin();
  }, [autoJoin, call, handleJoin, isJoining, show]);

  useEffect(() => {
    if (!call) {
      return;
    }

    if (
      callingState === CallingState.LEFT ||
      callingState === CallingState.OFFLINE
    ) {
      setShow("ended");
      return;
    }

    if (callingState === CallingState.JOINED) {
      setShow("call");
    }
  }, [call, callingState]);

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} isJoining={isJoining} />}
      {show === "call" && (
        <CallActive
          meetingId={meetingId}
          meetingName={meetingName}
          meetingCode={meetingCode}
          canManage={canManage}
          aiMode={aiMode}
          onLeave={handleLeave}
          isLeaving={isLeaving}
        />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  )
};
