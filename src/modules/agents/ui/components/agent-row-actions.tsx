"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { MoreVerticalIcon, PencilIcon, StarIcon, TrashIcon } from "lucide-react";
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

const renameAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
});

interface Props {
  agentId: string;
  agentName: string;
  instructions: string;
  isStarred: boolean;
}

export const AgentRowActions = ({
  agentId,
  agentName,
  instructions,
  isStarred,
}: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [ConfirmDelete, confirmDelete] = useConfirm(
    "Delete agent?",
    "This agent and its associated meetings will be removed permanently.",
  );

  const form = useForm<z.infer<typeof renameAgentSchema>>({
    resolver: zodResolver(renameAgentSchema),
    defaultValues: {
      name: agentName,
    },
  });

  const invalidateAgents = async () => {
    await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
    await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: agentId }));
  };

  const updateAgent = useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async () => {
        await invalidateAgents();
        setIsRenameOpen(false);
        toast.success("Agent renamed");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await invalidateAgents();
        toast.success("Agent deleted");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const toggleStar = useMutation(
    trpc.agents.toggleStar.mutationOptions({
      onSuccess: async () => {
        await invalidateAgents();
        toast.success(isStarred ? "Agent unstarred" : "Agent starred");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onRename = (values: z.infer<typeof renameAgentSchema>) => {
    updateAgent.mutate({
      id: agentId,
      name: values.name,
      instructions,
    });
  };

  const onDelete = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) {
      return;
    }

    removeAgent.mutate({ id: agentId });
  };

  return (
    <>
      <ConfirmDelete />
      <ResponsiveDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        title="Rename agent"
        description="Update the agent name."
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
                    <Input {...field} placeholder="Agent name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" disabled={updateAgent.isPending} type="submit">
              {updateAgent.isPending ? "Saving..." : "Save"}
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
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              form.reset({ name: agentName });
              setIsRenameOpen(true);
            }}
          >
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              toggleStar.mutate({ id: agentId, isStarred: !isStarred });
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
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
