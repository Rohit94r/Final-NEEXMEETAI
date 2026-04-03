"use client";

import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { 
  UsersIcon, 
  TargetIcon, 
  HistoryIcon, 
  ShieldCheckIcon,
  PieChartIcon,
  TargetIcon as AccountabilityIcon
} from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckInCard } from "./check-in-card";
import { AttendanceCalendar } from "./attendance-calendar";
import { AdminAttendanceView } from "./admin-attendance-view";
import { ReasonModal } from "./reason-modal";

interface PresencePanelProps {
  roomId: string;
  isOwner?: boolean;
}

export const PresencePanel = ({ roomId, isOwner = false }: PresencePanelProps) => {
  const trpc = useTRPC();
  const today = format(new Date(), "yyyy-MM-dd");
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reasonModalOpen, setReasonModalOpen] = useState(false);

  const { data: calendarData, refetch: refetchCalendar } = useQuery({
    ...trpc.presence.getCalendar.queryOptions({
      roomId,
      month: currentMonth
    }),
    staleTime: 30000,
  });

  const records = calendarData?.records || [];
  const joinedAt = calendarData?.joinedAt;

  const { data: presenceData, refetch: refetchToday } = useQuery({
    ...trpc.presence.getByRoom.queryOptions({
      roomId,
      date: today
    }),
    staleTime: 30000,
  });

  const alreadyCheckedIn = useMemo(() => {
    return !!records.find((a: any) => a.date === today);
  }, [records, today]);

  const stats = useMemo(() => {
    if (!joinedAt) return { rate: "0%", total: 0, late: 0, streak: 0 };
    
    const joined = new Date(joinedAt);
    const todayDate = new Date();
    const diffTime = Math.abs(todayDate.getTime() - joined.getTime());
    const totalDaysSinceJoin = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const presentCount = records.filter((r: any) => r.status === "present" || r.status === "late").length;
    const lateCount = records.filter((r: any) => r.status === "late").length;
    const rate = Math.round((presentCount / totalDaysSinceJoin) * 100);
    
    return { 
      rate: `${rate}%`, 
      total: totalDaysSinceJoin, 
      late: lateCount,
      present: presentCount 
    };
  }, [records, joinedAt]);

  const onSelectDate = (date: Date, status: string | null) => {
    setSelectedDate(date);
    if (status === "absent" && !isSameDay(date, new Date())) {
      setReasonModalOpen(true);
    }
  };

  const handleSuccess = () => {
    refetchCalendar();
    refetchToday();
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Presence Navigation Header */}
      <div className="flex items-center justify-between px-6 pt-4">
        <div className="flex items-center gap-3">
           <AccountabilityIcon className="size-6 text-primary animate-pulse" />
           <h2 className="text-xl font-bold tracking-tight">Presence Engine</h2>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full px-6">
        <TabsList className="bg-transparent h-12 gap-6 p-0 border-b w-full justify-start rounded-none mb-8">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 font-bold"
          >
            <PieChartIcon className="size-4" />
            My Snapshot
          </TabsTrigger>
          {isOwner && (
             <TabsTrigger 
               value="admin" 
               className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none h-full px-2 gap-2 text-muted-foreground hover:text-emerald-600 transition-all duration-300 font-bold"
             >
               <ShieldCheckIcon className="size-4" />
               Team Oversight
             </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
               <CheckInCard 
                 roomId={roomId} 
                 alreadyCheckedIn={alreadyCheckedIn} 
                 onSuccess={handleSuccess}
               />
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl border-2 bg-emerald-50/50 flex flex-col gap-1 shadow-sm">
                     <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Attendance Rate</span>
                     <span className="text-2xl font-bold text-emerald-900">{stats.rate}</span>
                  </div>
                  <div className="p-4 rounded-2xl border-2 bg-amber-50/50 flex flex-col gap-1 shadow-sm">
                     <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Late Counts</span>
                     <span className="text-2xl font-bold text-amber-900">{stats.late}d</span>
                  </div>
                  <div className="hidden md:flex p-4 rounded-2xl border-2 bg-indigo-50/50 flex flex-col gap-1 shadow-sm">
                     <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Days Joined</span>
                     <span className="text-2xl font-bold text-indigo-900">{stats.total}d</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-8">
               <AttendanceCalendar 
                 attendanceData={records} 
                 joinedAt={joinedAt}
                 onSelectDate={onSelectDate}
                 currentDate={selectedDate}
               />
               
               <div className="p-6 rounded-2xl border-2 bg-slate-50 flex items-center gap-4 text-center justify-center border-dashed group cursor-default">
                  <TargetIcon className="size-8 text-slate-300 group-hover:text-primary transition-colors duration-500 hover:scale-110" />
                  <div className="text-left">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Active Presence</p>
                     <p className="text-lg font-extrabold text-slate-700">{stats.present} Days Verified</p>
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <AdminAttendanceView roomId={roomId} />
        </TabsContent>
      </Tabs>

      <ReasonModal 
        open={reasonModalOpen} 
        onOpenChange={setReasonModalOpen} 
        roomId={roomId} 
        date={selectedDate} 
        onSuccess={handleSuccess}
      />
    </div>
  );
};
