"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, SparklesIcon, LoaderIcon, LightbulbIcon } from "lucide-react";

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
  meetingId?: string;
  showExtract?: boolean;
}

export const DecisionsPanel = ({ meetingId, showExtract = false }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [context, setContext] = useState("");

  const decisions = useQuery(
    meetingId
      ? trpc.workspace.decisions.getByMeeting.queryOptions({ meetingId })
      : trpc.workspace.decisions.getMany.queryOptions(),
  );

  const invalidate = () => {
    queryClient.invalidateQueries(trpc.workspace.decisions.getMany.queryOptions());
    if (meetingId) {
      queryClient.invalidateQueries(trpc.workspace.decisions.getByMeeting.queryOptions({ meetingId }));
    }
  };

  const create = useMutation(
    trpc.workspace.decisions.create.mutationOptions({
      onSuccess: () => { toast.success("Decision saved"); invalidate(); setOpen(false); setContent(""); setContext(""); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const remove = useMutation(
    trpc.workspace.decisions.remove.mutationOptions({
      onSuccess: () => { toast.success("Decision removed"); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const extract = useMutation(
    trpc.workspace.decisions.extractFromMeeting.mutationOptions({
      onSuccess: (data) => { toast.success(`${data.length} decisions extracted`); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {showExtract && meetingId && (
            <Button size="sm" variant="outline" disabled={extract.isPending} onClick={() => extract.mutate({ meetingId })}>
              {extract.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
              Extract with AI
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><PlusIcon className="size-4" />Add Decision</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Decision</DialogTitle></DialogHeader>
              <div className="flex flex-col gap-3 pt-2">
                <Input placeholder="Decision (e.g. We will use Next.js)" value={content} onChange={(e) => setContent(e.target.value)} />
                <Textarea placeholder="Context — who decided it and why (optional)" value={context} onChange={(e) => setContext(e.target.value)} rows={3} />
                <Button
                  disabled={!content.trim() || create.isPending}
                  onClick={() => create.mutate({ content, context: context || null, meetingId: meetingId ?? null })}
                >
                  {create.isPending ? <LoaderIcon className="size-4 animate-spin" /> : null}
                  Save Decision
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {decisions.isPending ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : decisions.data?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No decisions yet. {showExtract ? "Use \"Extract with AI\" to auto-generate." : "Record your first decision."}
          </div>
        ) : (
          decisions.data?.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border bg-white px-4 py-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 shrink-0">
                  <LightbulbIcon className="size-3.5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{d.content}</p>
                  {d.context && <p className="mt-0.5 text-xs text-muted-foreground">{d.context}</p>}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="size-7 p-0 shrink-0 text-muted-foreground hover:text-red-600"
                onClick={() => remove.mutate({ id: d.id })}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
