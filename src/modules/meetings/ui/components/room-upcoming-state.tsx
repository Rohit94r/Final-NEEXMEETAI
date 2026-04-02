import Link from "next/link";
import { VideoIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  meetingId: string;
  canManage: boolean;
}

export const RoomUpcomingState = ({ meetingId, canManage }: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-8 flex flex-col gap-y-6 items-center justify-center">
      <div className="rounded-full bg-blue-50 p-4">
        <UsersIcon className="size-8 text-blue-600" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {canManage ? "Ready to start" : "Meeting is ready"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {canManage
            ? "Click below to open the meeting room and let your team join."
            : "The admin has set up this meeting. Click below to join when ready."}
        </p>
      </div>
      <Button asChild size="lg">
        <Link href={`/call/${meetingId}`}>
          <VideoIcon />
          {canManage ? "Start Meeting" : "Join Meeting"}
        </Link>
      </Button>
    </div>
  );
};
