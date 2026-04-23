"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BotIcon,
  VideoIcon,
  CheckCircleIcon,
  CalendarClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "lucide-react";
import { format } from "date-fns";

import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/shared/generated-avatar";

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500/10 text-blue-700 border-blue-700/10",
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-700/10",
  completed: "bg-gray-500/10 text-gray-600 border-gray-600/10",
  processing: "bg-amber-500/10 text-amber-700 border-amber-700/10",
  cancelled: "bg-red-500/10 text-red-600 border-red-600/10",
};

export const HomeView = () => {
  const trpc = useTRPC();

  const meetings = useQuery(trpc.meetings.getMany.queryOptions({ pageSize: 5 }));
  const agents = useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100 }));
  const allMeetings = useQuery(trpc.meetings.getMany.queryOptions({ pageSize: 100 }));

  const totalMeetings = allMeetings.data?.total ?? 0;
  const totalAgents = agents.data?.total ?? 0;
  const completedMeetings = allMeetings.data?.items.filter((m) => m.status === "completed").length ?? 0;
  const upcomingMeetings = allMeetings.data?.items.filter((m) => m.status === "upcoming").length ?? 0;

  const stats = [
    {
      label: "Total Meetings",
      value: totalMeetings,
      icon: VideoIcon,
      href: "/meetings",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "AI Agents",
      value: totalAgents,
      icon: BotIcon,
      href: "/agents",
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Completed",
      value: completedMeetings,
      icon: CheckCircleIcon,
      href: "/meetings?status=completed",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Upcoming",
      value: upcomingMeetings,
      icon: CalendarClockIcon,
      href: "/meetings?status=upcoming",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex-1 py-6 px-4 md:px-8 flex flex-col gap-y-8 overflow-y-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your meetings and AI agents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-lg border bg-white px-4 py-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
          >
            <div className={`rounded-full w-fit p-2 ${stat.bg}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Meetings */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-2">
            <VideoIcon className="size-4 text-muted-foreground" />
            <h2 className="font-medium">Recent Meetings</h2>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/meetings">
              View all
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="divide-y">
          {meetings.isPending ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : meetings.data?.items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No meetings yet.{" "}
              <Link href="/meetings" className="underline underline-offset-4">
                Create your first meeting
              </Link>
            </div>
          ) : (
            meetings.data?.items.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <GeneratedAvatar
                    seed={meeting.agent.name}
                    variant="botttsNeutral"
                    className="size-8 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{meeting.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {meeting.agent.name} &middot;{" "}
                      {format(new Date(meeting.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[meeting.status] ?? ""}
                >
                  {meeting.status}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-white px-4 py-5">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="size-4 text-muted-foreground" />
          <h2 className="font-medium">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/meetings">
              <VideoIcon />
              New Meeting
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/agents">
              <BotIcon />
              New Agent
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
