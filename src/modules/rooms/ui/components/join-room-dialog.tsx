"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  trigger: React.ReactNode;
}

export const JoinRoomDialog = ({ trigger }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const join = useMutation(
    trpc.rooms.joinByCode.mutationOptions({
      onSuccess: (data) => {
        toast.success("Joined room");
        setOpen(false);
        setCode("");
        router.push(`/rooms/${data.roomId}`);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Input
            placeholder="Enter invite code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            disabled={!code.trim() || join.isPending}
            onClick={() => join.mutate({ code: code.trim() })}
          >
            {join.isPending && <LoaderIcon className="size-4 animate-spin" />}
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
