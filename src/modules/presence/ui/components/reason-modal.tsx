"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AlertCircleIcon, LoaderIcon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  date: Date;
  onSuccess: () => void;
}

export const ReasonModal = ({ 
  open, 
  onOpenChange, 
  roomId, 
  date, 
  onSuccess 
}: ReasonModalProps) => {
  const [reason, setReason] = useState("");
  const trpc = useTRPC();
  const submitReason = useMutation(trpc.presence.submitReason.mutationOptions({
    onSuccess: () => {
      toast.success("Reason submitted for review");
      setReason("");
      onSuccess();
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  }));

  const handleSubmit = () => {
    if (!reason.trim() || reason.length < 5) {
      toast.error("Please provide a valid reason (at least 5 characters)");
      return;
    }

    submitReason.mutate({
      roomId,
      date: format(date, "yyyy-MM-dd"),
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white overflow-hidden p-0 border-none shadow-2xl">
        <div className="bg-red-500 p-6 flex flex-col items-center justify-center text-white text-center gap-2">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 animate-pulse">
               <AlertCircleIcon className="size-8" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Reason for Absence</DialogTitle>
            <DialogDescription className="text-red-100 font-medium">
               Providing a reason helps with accountability for **{format(date, "EEEE, MMMM d")}**.
            </DialogDescription>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
           <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Justification</label>
              <Textarea 
                id="reason"
                placeholder="Briefly explain why you missed your attendance today..."
                className="min-h-[120px] resize-none border-2 focus-visible:ring-red-500 rounded-xl"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                 <AlertCircleIcon className="size-3" />
                 Your response will be reviewed by the room admin.
              </p>
           </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">Cancel</Button>
           <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg border-b-4 border-red-800"
              onClick={handleSubmit}
              disabled={submitReason.isPending}
           >
              {submitReason.isPending ? <LoaderIcon className="size-4 animate-spin mr-2" /> : <CheckCircle2Icon className="size-4 mr-2" />}
              Submit Reason
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
