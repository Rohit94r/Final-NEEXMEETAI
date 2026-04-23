import Link from "next/link"
import { VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/feedback/empty-state"

interface Props {
  meetingId: string;
  canManage: boolean;
}

export const UpcomingState = ({
  meetingId,
  canManage,
}: Props) => {
  const title = canManage ? "Not started yet" : "Meeting is ready to join";
  const description = canManage
    ? "Start the meeting when you're ready. Members can join from the shared link or the 4-digit meeting code."
    : "Your access has been approved. Open the meeting room when you're ready to join.";

  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title={title}
        description={description}
      />
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            {canManage ? "Start Meeting" : "Join Meeting"}
          </Link>
        </Button>
      </div>
    </div>
  )
}
