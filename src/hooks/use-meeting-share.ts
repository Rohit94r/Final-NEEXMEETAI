"use client";

import { useCallback } from "react";
import { toast } from "sonner";

export const useMeetingShare = (meetingId: string) => {
  return useCallback(async () => {
    const joinUrl = `${window.location.origin}/call/${meetingId}`;

    try {
      await navigator.clipboard.writeText(joinUrl);
      toast.success("Meeting link copied");
      console.info("[meetings.share] Copied join link", { meetingId, joinUrl });
    } catch (error) {
      console.error("[meetings.share] Failed to copy join link", error);
      toast.error("Unable to copy meeting link");
    }
  }, [meetingId]);
};
