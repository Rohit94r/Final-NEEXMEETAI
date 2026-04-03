"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  PlusIcon, TrashIcon, SparklesIcon, LoaderIcon, CalendarIcon, UserIcon, 
  FingerprintIcon 
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusColors = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

const statusLabel = { todo: "To Do", in_progress: "In Progress", done: "Done" };

interface Props {
  meetingId?: string;
  roomId?: string;
  showExtract?: boolean;
}

export const TasksPanel = ({ meetingId, roomId, showExtract = false }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const tasks = useQuery(
    trpc.workspace.tasks.getMany.queryOptions({
      status: statusFilter !== "all" ? (statusFilter as "todo" | "in_progress" | "done") : undefined,
      meetingId: meetingId ?? undefined,
      roomId: roomId ?? undefined,
    }),
  );

  const { data: attendanceData } = useQuery(
    trpc.presence.getByRoom.queryOptions(
      { roomId: roomId as string, date: format(new Date(), "yyyy-MM-dd") },
      { enabled: !!roomId }
    )
  );

  const getAssigneePresence = (name: string | null) => {
    if (!name || !attendanceData?.attendance) return null;
    const record = attendanceData.attendance.find(a => a.user.name.toLowerCase() === name.toLowerCase());
    return record?.status || null;
  };

  const invalidate = () =>
    queryClient.invalidateQueries(trpc.workspace.tasks.getMany.queryOptions({}));

  const createTask = useMutation(
    trpc.workspace.tasks.create.mutationOptions({
      onSuccess: () => { toast.success("Task created"); invalidate(); setNewTaskOpen(false); setTitle(""); setAssigneeName(""); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const updateTask = useMutation(
    trpc.workspace.tasks.update.mutationOptions({
      onSuccess: () => invalidate(),
      onError: (e) => toast.error(e.message),
    }),
  );

  const removeTask = useMutation(
    trpc.workspace.tasks.remove.mutationOptions({
      onSuccess: () => { toast.success("Task deleted"); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const extractTasks = useMutation(
    trpc.workspace.tasks.extractFromMeeting.mutationOptions({
      onSuccess: (data) => {
        toast.success(`${data.length} tasks extracted from meeting`);
        invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Attendance Summary Bar (for visibility) */}
      {roomId && attendanceData?.attendance && attendanceData.attendance.length > 0 && (
        <div className="bg-slate-50/80 border-2 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                <FingerprintIcon className="size-5 text-primary" />
             </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Today&apos;s Presence</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase opacity-60 tracking-wider">Verified Team Snapshot</p>
              </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar max-w-full">
             {attendanceData.attendance.map((att) => (
                <TooltipProvider key={att.user.id}>
                   <Tooltip>
                      <TooltipTrigger asChild>
                         <div className="flex items-center gap-1.5 p-1 px-2 rounded-full bg-white border-2 hover:border-primary/30 transition-all cursor-default">
                            <div className="relative">
                               <Avatar className="size-6 rounded-lg pointer-events-none border ring-1 ring-slate-100">
                                  <AvatarImage src={att.user.image || ""} />
                                  <AvatarFallback className="text-[10px] font-bold uppercase rounded-lg bg-slate-50">{att.user.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div className={cn(
                                  "absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-white",
                                  att.status === "present" ? "bg-emerald-500" :
                                  att.status === "late" ? "bg-amber-500" : "bg-red-500"
                               )} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[60px]">{att.user.name}</span>
                         </div>
                      </TooltipTrigger>
                      <TooltipContent>
                         <p className="text-xs font-bold uppercase tracking-tight">{att.user.name} ({att.status})</p>
                      </TooltipContent>
                   </Tooltip>
                </TooltipProvider>
             ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tasks</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {showExtract && meetingId && (
            <Button
              size="sm"
              variant="outline"
              disabled={extractTasks.isPending}
              onClick={() => extractTasks.mutate({ meetingId })}
            >
              {extractTasks.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
              Extract with AI
            </Button>
          )}
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><PlusIcon className="size-4" />Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-3 pt-2">
                <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Assignee name (optional)" value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} />
                <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low priority</SelectItem>
                    <SelectItem value="medium">Medium priority</SelectItem>
                    <SelectItem value="high">High priority</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  disabled={!title.trim() || createTask.isPending}
                  onClick={() => createTask.mutate({ title, assigneeName: assigneeName || null, priority, meetingId: meetingId ?? null, roomId: roomId ?? null })}
                >
                  {createTask.isPending ? <LoaderIcon className="size-4 animate-spin" /> : null}
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.isPending ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading tasks...</div>
        ) : tasks.data?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet. {showExtract ? "Use \"Extract with AI\" to auto-generate from meeting." : "Add your first task."}
          </div>
        ) : (
          tasks.data?.map((task) => (
            <div key={task.id} className="flex items-start justify-between gap-3 rounded-lg border bg-white px-4 py-3">
              <div className="flex flex-col gap-1.5 min-w-0">
                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${statusColors[task.status]}`}>
                    {statusLabel[task.status]}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </Badge>
                  {task.assigneeName && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 group">
                      {roomId && getAssigneePresence(task.assigneeName) && (
                         <div className="flex items-center mr-0.5">
                            <div className={cn(
                               "size-2 rounded-full",
                               getAssigneePresence(task.assigneeName) === "present" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                               getAssigneePresence(task.assigneeName) === "late" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
                               "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            )} />
                         </div>
                      )}
                      <UserIcon className="size-3 text-muted-foreground" />
                      <span className="text-xs font-semibold text-slate-700">{task.assigneeName}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="size-3" />{format(new Date(task.dueDate), "MMM d")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Select
                  value={task.status}
                  onValueChange={(v) => updateTask.mutate({ id: task.id, status: v as "todo" | "in_progress" | "done" })}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-7 p-0 text-muted-foreground hover:text-red-600"
                  onClick={() => removeTask.mutate({ id: task.id })}
                >
                  <TrashIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
