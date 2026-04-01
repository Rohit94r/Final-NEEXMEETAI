"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const inviteMemberSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
});

interface InviteMemberDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteMemberDialog = ({
  meetingId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof inviteMemberSchema>>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const inviteMember = useMutation(
    trpc.meetings.inviteMember.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.meetings.getOne.queryOptions({ id: meetingId }),
        );
        await queryClient.invalidateQueries(
          trpc.meetings.getMany.queryOptions({}),
        );

        toast.success("Member invited");
        form.reset();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof inviteMemberSchema>) => {
    inviteMember.mutate({
      meetingId,
      email: values.email,
    });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Invite Member"
      description="Invite an existing user by email so they can join your meeting."
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="member@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button disabled={inviteMember.isPending} type="submit">
              {inviteMember.isPending ? "Inviting..." : "Invite member"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
