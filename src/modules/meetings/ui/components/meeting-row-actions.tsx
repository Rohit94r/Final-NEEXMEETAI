"use client";

import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
  CopyIcon,
  ExternalLinkIcon,
  LinkIcon,
  MoreVerticalIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const renameMeetingSchema = z.object({
  name: z.string().min(1, "Meeting name is required"),
});

interface Props {
  meetingId: string;
  meetingName: string;
  agentId: string;
  isStarred: boolean;
  isOwner: boolean;
  secretCode: string;
}

export const MeetingRowActions = ({
  meetingId,
  meetingName,
  agentId,
  isStarred,
  isOwner,
  secretCode,
}: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [ConfirmDelete, confirmDelete] = useConfirm(
    isOwner ? "Delete meeting?" : "Remove meeting?",
    isOwner
      ? "This meeting will be removed permanently."
      : "This will only remove the meeting from your list.",
  );
  const form = useForm<z.infer<typeof renameMeetingSchema>>({
    resolver: zodResolver(renameMeetingSchema),
    defaultValues: {
      name: meetingName,
    },
  });

  const invalidateMeetings = async () => {
    await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
    await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: meetingId }));
  };

  const updateMeeting = useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetings();
        setIsRenameOpen(false);
        toast.success("Meeting renamed");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetings();
        toast.success("Meeting deleted");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const toggleStar = useMutation(
    trpc.meetings.toggleStar.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetings();
        toast.success(isStarred ? "Meeting unstarred" : "Meeting starred");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const leaveMeeting = useMutation(
    trpc.meetings.leaveMeeting.mutationOptions({
      onSuccess: async () => {
        await invalidateMeetings();
        toast.success("Meeting removed from your list");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onRename = (values: z.infer<typeof renameMeetingSchema>) => {
    updateMeeting.mutate({
      id: meetingId,
      name: values.name,
      agentId,
    });
  };

  const onDelete = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) {
      return;
    }

    if (isOwner) {
      removeMeeting.mutate({ id: meetingId });
      return;
    }

    leaveMeeting.mutate({ meetingId });
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(secretCode);
    toast.success("Meeting code copied");
  };

  const handleCopyLink = async () => {
    const meetingLink = `${window.location.origin}/call/${meetingId}`;
    await navigator.clipboard.writeText(meetingLink);
    toast.success("Meeting link copied");
  };

  return (
    <>
      <ConfirmDelete />
      <ResponsiveDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        title="Rename meeting"
        description="Update the meeting name."
      >
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onRename)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Meeting name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              disabled={updateMeeting.isPending}
              type="submit"
            >
              {updateMeeting.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </ResponsiveDialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner ? (
            <>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  form.reset({ name: meetingName });
                  setIsRenameOpen(true);
                }}
              >
                <PencilIcon />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  toggleStar.mutate({ id: meetingId, isStarred: !isStarred });
                }}
              >
                <StarIcon className={isStarred ? "fill-current text-yellow-500" : undefined} />
                {isStarred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete();
                }}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCopyCode();
                }}
              >
                <CopyIcon />
                Copy code
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCopyLink();
                }}
              >
                <LinkIcon />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/meetings/${meetingId}`} onClick={(event) => event.stopPropagation()}>
                  <ExternalLinkIcon />
                  Open details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete();
                }}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
