"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CornerDownRightIcon, StarIcon, VideoIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { GeneratedAvatar } from "@/components/shared/generated-avatar"

import { AgentsGetMany } from "../../types"
import { AgentRowActions } from "./agent-row-actions";

export const columns: ColumnDef<AgentsGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          {row.original.isStarred ? (
            <StarIcon className="size-4 fill-yellow-400 text-yellow-500" />
          ) : null}
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.name}
            className="size-6"
          />
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <CornerDownRightIcon className="size-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
            {row.original.instructions}
          </span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "meetingCount",
    header: "Meetings",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex items-center gap-x-2 [&>svg]:size-4"
      >
        <VideoIcon className="text-blue-700" />
        {row.original.meetingCount} {row.original.meetingCount === 1 ? "meeting" : "meetings"}
      </Badge>
    )
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <AgentRowActions
          agentId={row.original.id}
          agentName={row.original.name}
          instructions={row.original.instructions}
          isStarred={row.original.isStarred}
        />
      </div>
    ),
  },
]
