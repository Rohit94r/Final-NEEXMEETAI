"use client";

import { ReactNode } from "react";
import { CopyIcon, LinkIcon, LockKeyholeIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  meetingId: string;
  meetingCode: string;
  meetingName: string;
  trigger: ReactNode;
}

export const CallSharePanel = ({
  meetingId,
  meetingCode,
  meetingName,
  trigger,
}: Props) => {
  const joinUrl =
    typeof window === "undefined"
      ? `/call/${meetingId}`
      : `${window.location.origin}/call/${meetingId}`;

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch (error) {
      console.error(`[call.share] Failed to copy ${label.toLowerCase()}`, error);
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Share meeting</SheetTitle>
          <SheetDescription>
            Invite teammates to {meetingName} using the secure link or 4-digit meeting code.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LinkIcon className="size-4" />
              Meeting link
            </div>
            <p className="mt-2 break-all text-sm text-muted-foreground">{joinUrl}</p>
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => copyValue(joinUrl, "Meeting link")}
            >
              <CopyIcon />
              Copy link
            </Button>
          </div>
          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LockKeyholeIcon className="size-4" />
              Meeting code
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-[0.4em]">{meetingCode}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Participants can open the meetings page and join with this code.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => copyValue(meetingCode, "Meeting code")}
            >
              <CopyIcon />
              Copy code
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
