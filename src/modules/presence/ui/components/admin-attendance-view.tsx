"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  UsersIcon, 
  SearchIcon, 
  CheckCircle2Icon, 
  XCircleIcon, 
  ClockIcon, 
  MessageSquareIcon,
  EyeIcon,
  ShieldCheckIcon,
  CalendarDaysIcon
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface AdminAttendanceViewProps {
  roomId: string;
}

interface ReasonWithUser {
  id: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  userName: string;
}

export const AdminAttendanceView = ({ roomId }: AdminAttendanceViewProps) => {
  const trpc = useTRPC();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [selectedReason, setSelectedReason] = useState<ReasonWithUser | null>(null);

  const { data: presenceData, refetch } = useQuery({
    ...trpc.presence.getByRoom.queryOptions({ 
      roomId, 
      date: selectedDate 
    }),
    staleTime: 30000,
  });

  const attendanceList = presenceData?.attendance || [];

  const reviewMutation = useMutation(trpc.presence.reviewReason.mutationOptions({
    onSuccess: () => {
      toast.success("Reason status updated");
      refetch();
      setSelectedReason(null);
    },
    onError: (e) => toast.error(e.message),
  }));

  const filtered = attendanceList.filter((a) => 
    a.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusIcons: Record<string, React.ReactNode> = {
    present: <CheckCircle2Icon className="size-4 text-emerald-500" />,
    late: <ClockIcon className="size-4 text-amber-500" />,
    absent: <XCircleIcon className="size-4 text-red-500" />,
  };

  const handleReview = (reasonId: string, status: "approved" | "rejected") => {
    reviewMutation.mutate({ reasonId, status });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Admin Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
           <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
              <ShieldCheckIcon className="size-6 text-indigo-600" />
           </div>
           <div>
              <h2 className="text-lg font-bold tracking-tight">Attendance Manager</h2>
              <p className="text-xs font-semibold text-muted-foreground uppercase opacity-60 tracking-wider">Room Oversight Control</p>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                 placeholder="Search members..." 
                 className="pl-9 h-11 w-[200px] md:w-[240px] rounded-xl border-2 focus-visible:ring-indigo-500" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                 type="date"
                 className="pl-9 h-11 w-[160px] rounded-xl border-2 cursor-pointer focus-visible:ring-indigo-500" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border-2 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px] font-bold text-[10px] uppercase tracking-widest text-slate-400">Member</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Timestamp</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Joined Room</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-3 opacity-30">
                      <UsersIcon className="size-12" />
                      <p className="text-sm font-medium">No records found for this date.</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((att) => (
              <TableRow key={att.id || att.user.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <AvatarImage src={att.user.image || ""} />
                      <AvatarFallback className="rounded-xl font-bold text-xs uppercase bg-slate-100 text-slate-500">
                        {att.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{att.user.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 truncate uppercase opacity-80">{att.member.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                       "p-1.5 rounded-lg border",
                       (att.status === "present" || !att.status) ? "bg-emerald-50 border-emerald-100" :
                       att.status === "late" ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
                    )}>
                       {statusIcons[att.status || "absent"]}
                    </div>
                    <span className={cn(
                       "text-xs font-bold uppercase tracking-tight",
                       att.status === "present" ? "text-emerald-600" :
                       att.status === "late" ? "text-amber-600" : "text-red-600"
                    )}>
                      {att.status || "absent"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-slate-600">
                    {att.timestamp ? format(new Date(att.timestamp), "h:mm:ss aa") : "--:--:--"}
                  </span>
                </TableCell>
                <TableCell>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Joined</span>
                      <span className="text-xs font-bold text-slate-700">{format(new Date(att.member.joinedAt), "MMM d, yyyy")}</span>
                   </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {att.reason?.content && (
                       <Badge 
                          variant={att.reason.status === "pending" ? "default" : "secondary"}
                          className={cn(
                             "cursor-pointer hover:scale-105 transition-transform",
                             att.reason.status === "pending" ? "bg-red-500 hover:bg-red-600" : ""
                          )}
                          onClick={() => setSelectedReason({ 
                            id: att.reason!.id, 
                            content: att.reason!.content, 
                            status: att.reason!.status as "pending" | "approved" | "rejected", 
                            userName: att.user.name 
                          })}
                       >
                          <MessageSquareIcon className="size-3 mr-1" />
                          Review Reason
                       </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="size-8 p-0 rounded-lg" onClick={() => window.open(att.photoUrl || "", "_blank")}>
                       <EyeIcon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reason Review Dialog */}
      <Dialog open={!!selectedReason} onOpenChange={(open) => !open && setSelectedReason(null)}>
        {selectedReason && (
          <DialogContent className="max-w-md bg-white p-0 border-none shadow-2xl overflow-hidden rounded-3xl">
            <div className="bg-indigo-600 p-8 text-white flex flex-col items-center text-center gap-2">
               <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 rotate-3 mb-2">
                  <MessageSquareIcon className="size-8" />
               </div>
               <DialogTitle className="text-xl font-bold tracking-tight">Reason for Absence</DialogTitle>
               <DialogDescription className="text-indigo-100 font-medium">
                  Reviewing justification from **{selectedReason.userName}**
               </DialogDescription>
            </div>
            
            <div className="p-8">
               <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 italic text-sm text-slate-700 leading-relaxed shadow-inner">
                  &quot;{selectedReason.content}&quot;
               </div>
               
               {selectedReason.status !== "pending" && (
                 <div className="mt-6 flex items-center justify-center">
                    <Badge className={cn(
                       "px-4 py-1.5 rounded-full text-xs font-bold uppercase",
                       selectedReason.status === "approved" ? "bg-emerald-500" : "bg-red-500"
                    )}>
                       {selectedReason.status}
                    </Badge>
                 </div>
               )}
            </div>

            {selectedReason.status === "pending" && (
              <div className="p-8 pt-0 grid grid-cols-2 gap-3">
                 <Button 
                    variant="outline" 
                    className="h-12 rounded-2xl border-2 font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleReview(selectedReason.id, "rejected")}
                    disabled={reviewMutation.isPending}
                 >
                    Reject
                 </Button>
                 <Button 
                    className="h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg border-b-4 border-indigo-900 active:border-b-0 transition-all"
                    onClick={() => handleReview(selectedReason.id, "approved")}
                    disabled={reviewMutation.isPending}
                 >
                    Approve
                 </Button>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
