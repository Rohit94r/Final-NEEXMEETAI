"use client"

import Link from "next/link";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table"
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockArrowUpIcon,
  ClockFadingIcon,
  CornerDownRightIcon,
  EyeIcon,
  LoaderIcon,
  LogInIcon,
  StarIcon,
} from "lucide-react"

import { cn, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/shared/generated-avatar"

import { MeetingGetMany } from "../../types"
import { MeetingRowActions } from "./meeting-row-actions";

const statusIconMap = {
  upcoming: ClockArrowUpIcon,
  active: LoaderIcon,
  completed: CircleCheckIcon,
  processing: LoaderIcon,
  cancelled: CircleXIcon,
};

const statusColorMap = {
  upcoming: "bg-yellow-500/20 text-yellow-800 border-yellow-800/5",
  active: "bg-blue-500/20 text-blue-800 border-blue-800/5",
  completed: "bg-emerald-500/20 text-emerald-800 border-emerald-800/5",
  cancelled: "bg-rose-500/20 text-rose-800 border-rose-800/5",
  processing: "bg-gray-300/20 text-gray-800 border-gray-800/5",
}

export const columns: ColumnDef<MeetingGetMany[number]>[] = [
  {
    accessorKey: "name",
    header: "Meeting Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          {row.original.isStarred ? (
            <StarIcon className="size-4 fill-yellow-400 text-yellow-500" />
          ) : null}
          <span className="font-semibold capitalize">{row.original.name}</span>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-1">
            <CornerDownRightIcon className="size-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground max-w-[200px] truncate capitalize">
              {row.original.agent.name}
            </span>
          </div>
          <GeneratedAvatar
            variant="botttsNeutral"
            seed={row.original.agent.name}
            className="size-4"
          />
          <span className="text-sm text-muted-foreground">
            {row.original.startedAt ? format(row.original.startedAt, "MMM d") : ""}
          </span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const Icon = statusIconMap[row.original.status as keyof typeof statusIconMap];

      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize [&>svg]:size-4 text-muted-foreground",
            statusColorMap[row.original.status as keyof typeof statusColorMap]
          )}
        >
          <Icon
            className={cn(
              row.original.status === "processing" && "animate-spin"
            )}
          />
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "secretCode",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono tracking-[0.3em]">
        {row.original.secretCode}
      </Badge>
    ),
  },
  {
    accessorKey: "duration",
    header: "duration",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="capitalize [&>svg]:size-4 flex items-center gap-x-2"
      >
        <ClockFadingIcon className="text-blue-700" />
        {row.original.duration ? formatDuration(row.original.duration) : "No duration"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const isJoinable =
        row.original.status === "upcoming" || row.original.status === "active";

      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            size="sm"
            variant={isJoinable ? "default" : "outline"}
            onClick={(event) => event.stopPropagation()}
          >
            <Link href={isJoinable ? `/call/${row.original.id}` : `/meetings/${row.original.id}`}>
              {isJoinable ? <LogInIcon /> : <EyeIcon />}
              {isJoinable ? "Join Meeting" : "View Details"}
            </Link>
          </Button>
          <MeetingRowActions
            meetingId={row.original.id}
            meetingName={row.original.name}
            agentId={row.original.agentId}
            isStarred={row.original.isStarred}
            isOwner={row.original.isOwner}
            secretCode={row.original.secretCode}
          />
        </div>
      );
    },
  },
];
