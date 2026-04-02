"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, TrashIcon, FileTextIcon, LoaderIcon, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { format } from "date-fns";

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

export const DocumentsPanel = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const docs = useQuery(trpc.workspace.documents.getMany.queryOptions());

  const invalidate = () => queryClient.invalidateQueries(trpc.workspace.documents.getMany.queryOptions());

  const create = useMutation(
    trpc.workspace.documents.create.mutationOptions({
      onSuccess: () => { toast.success("Document created"); invalidate(); setCreateOpen(false); setTitle(""); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const update = useMutation(
    trpc.workspace.documents.update.mutationOptions({
      onSuccess: () => { toast.success("Saved"); invalidate(); setEditingId(null); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const remove = useMutation(
    trpc.workspace.documents.remove.mutationOptions({
      onSuccess: () => { toast.success("Document deleted"); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  );

  const startEdit = (doc: { id: string; title: string; content: string }) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
    setEditContent(doc.content);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><PlusIcon className="size-4" />New Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Document</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-3 pt-2">
              <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Button
                disabled={!title.trim() || create.isPending}
                onClick={() => create.mutate({ title })}
              >
                {create.isPending ? <LoaderIcon className="size-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3">
        {docs.isPending ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : docs.data?.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No documents yet. Create your first one.</div>
        ) : (
          docs.data?.map((doc) => (
            <div key={doc.id} className="rounded-lg border bg-white">
              {editingId === doc.id ? (
                <div className="flex flex-col gap-3 p-4">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    placeholder="Write your notes here..."
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={update.isPending}
                      onClick={() => update.mutate({ id: doc.id, title: editTitle, content: editContent })}
                    >
                      {update.isPending ? <LoaderIcon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      <XIcon className="size-4" />Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 shrink-0">
                      <FileTextIcon className="size-3.5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{doc.title}</p>
                      {doc.content ? (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{doc.content}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground italic">Empty document</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="size-7 p-0" onClick={() => startEdit(doc)}>
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => remove.mutate({ id: doc.id })}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
