"use client";

import { useState } from "react";
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isBefore,
  isAfter,
  startOfDay
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendanceCalendarProps {
  attendanceData: any[]; // Records array
  joinedAt?: Date | string;
  onSelectDate: (date: Date, status: string | null) => void;
  currentDate?: Date;
}

export const AttendanceCalendar = ({ 
  attendanceData, 
  joinedAt,
  onSelectDate,
  currentDate = new Date() 
}: AttendanceCalendarProps) => {
  const [viewDate, setViewDate] = useState(startOfMonth(currentDate));

  const days = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate),
  });

  const getDayStatus = (day: Date) => {
    // Check if before join
    if (joinedAt) {
      const joinedDate = startOfDay(new Date(joinedAt));
      if (isBefore(day, joinedDate)) return "before_join";
    }

    const dateStr = format(day, "yyyy-MM-dd");
    const record = attendanceData.find(a => a.date === dateStr);
    
    if (record) return record.status;
    
    const today = startOfDay(new Date());
    if (isBefore(day, today)) return "absent"; // Past missed days are auto-absent
    return null; // Future or today (pending)
  };

  const statusColors: any = {
    present: "bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200",
    late: "bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-200",
    absent: "bg-red-500 text-white border-red-600 shadow-sm shadow-red-200",
    before_join: "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-40",
  };

  const statusIcons: any = {
    present: <CheckCircle2Icon className="size-3" />,
    late: <ClockIcon className="size-3" />,
    absent: <XCircleIcon className="size-3" />,
    before_join: null,
  };

  return (
    <div className="p-4 bg-white rounded-2xl border-2 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
           <div className="p-2 rounded-xl bg-primary/10">
              <CalendarIcon className="size-5 text-primary" />
           </div>
           <div>
              <h3 className="font-bold text-sm tracking-tight">{format(viewDate, "MMMM yyyy")}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attendance History</p>
           </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-8"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Fill slots before start of month */}
        {Array.from({ length: startOfMonth(viewDate).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map((day) => {
          const status = getDayStatus(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, currentDate);
          
          return (
            <TooltipProvider key={day.toString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelectDate(day, status)}
                    className={cn(
                      "aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-200 hover:scale-105 active:scale-95 group",
                      status ? statusColors[status] : "bg-white border-slate-100 hover:bg-slate-50",
                      isToday && !status && "border-primary ring-2 ring-primary/20 bg-primary/5 shadow-inner",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      status ? "text-white" : "text-slate-600",
                      isToday && !status && "text-primary"
                    )}>
                      {format(day, "d")}
                    </span>
                    {status && (
                      <div className="mt-0.5 animate-in zoom-in duration-300">
                        {statusIcons[status]}
                      </div>
                    )}
                    {isToday && !status && (
                       <span className="absolute -top-1 -right-1 flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-white"></span>
                       </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-medium">
                    {format(day, "MMMM d, yyyy")} • {status ? status.toUpperCase() : "No record"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 items-center justify-center">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Absent</span>
        </div>
      </div>
    </div>
  );
};
