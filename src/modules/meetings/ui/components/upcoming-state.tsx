import Link from "next/link"
import { VideoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"

interface Props {
  meetingId: string;
  canManage: boolean;
}

export const UpcomingState = ({
  meetingId,
  canManage,
}: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title={canManage ? "Not started yet" : "Waiting for host"}
        description={
          canManage
            ? "Once you start this meeting, invited members can join from the shared link"
            : "The meeting admin needs to start the meeting before members can join"
        }
      />
      {canManage && (
        <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
          <Button asChild className="w-full lg:w-auto">
            <Link href={`/call/${meetingId}`}>
              <VideoIcon />
              Start meeting
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
