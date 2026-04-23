"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const CreateRoomDialog = ({ trigger }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation(
    trpc.rooms.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Team space created");
        queryClient.invalidateQueries(trpc.rooms.getMany.queryOptions());
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/rooms/${data.id}`);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Team Space</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Input
            placeholder="Space name (e.g. Frontend Team)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <Button
            disabled={!name.trim() || create.isPending}
            onClick={() => create.mutate({ name, description: description || null })}
          >
            {create.isPending && <LoaderIcon className="size-4 animate-spin" />}
            Create Space
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
