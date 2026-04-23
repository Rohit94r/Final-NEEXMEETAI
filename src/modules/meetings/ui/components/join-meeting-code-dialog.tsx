"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ResponsiveDialog } from "@/components/shared/responsive-dialog";
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

const joinMeetingCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{4}$/, "Enter a valid 4-digit code"),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinMeetingCodeDialog = ({ open, onOpenChange }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const form = useForm<z.infer<typeof joinMeetingCodeSchema>>({
    resolver: zodResolver(joinMeetingCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const joinByCode = useMutation(
    trpc.meetings.joinByCode.mutationOptions({
      onSuccess: (data) => {
        form.reset();
        onOpenChange(false);
        router.push(`/call/${data.meetingId}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (values: z.infer<typeof joinMeetingCodeSchema>) => {
    joinByCode.mutate({ code: values.code });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Join Meeting"
      description="Enter the 4-digit code shared by the meeting owner."
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1234"
                    onChange={(event) => {
                      field.onChange(event.target.value.replace(/\D/g, "").slice(0, 4));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" disabled={joinByCode.isPending} type="submit">
            {joinByCode.isPending ? "Opening meeting..." : "Join Meeting"}
          </Button>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};
