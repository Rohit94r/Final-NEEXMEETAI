"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { useConfirm } from "@/hooks/use-confirm";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { ActiveState } from "../components/active-state";
import { UpcomingState } from "../components/upcoming-state";
import { CancelledState } from "../components/cancelled-state";
import { ProcessingState } from "../components/processing-state";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { InviteMemberDialog } from "../components/invite-member-dialog";
import { MeetingMembersCard } from "../components/meeting-members-card";
import { MeetingJoinRequestsCard } from "../components/meeting-join-requests-card";
import { MeetingAiOverviewCard } from "../components/meeting-ai-overview-card";

const CompletedState = dynamic(
  () =>
    import("../components/completed-state").then((mod) => mod.CompletedState),
  {
    ssr: false,
    loading: () => (
      <LoadingState
        title="Loading Meeting Summary"
        description="Preparing summary, transcript, and chat"
      />
    ),
  },
);

interface Props {
  meetingId: string;
};

export const MeetingIdView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    "The following action will remove this meeting"
  );

  const { data } = useSuspenseQuery(
    {
      ...trpc.meetings.getOne.queryOptions({ id: meetingId }),
      refetchInterval: 3000,
    },
  );

  const removeMeeting = useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        router.push("/meetings");
      },
    }),
  );

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    await removeMeeting.mutateAsync({ id: meetingId });
  };

  const isActive = data.status === "active";
  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isProcessing = data.status === "processing";

  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <InviteMemberDialog
        meetingId={meetingId}
        open={inviteMemberDialogOpen}
        onOpenChange={setInviteMemberDialogOpen}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          meetingCode={data.secretCode}
          canManage={data.canManage}
          canShare={isUpcoming || isActive}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onRemove={handleRemoveMeeting}
          onInvite={() => setInviteMemberDialogOpen(true)}
        />
        <MeetingMembersCard
          meetingId={meetingId}
          members={data.participants}
          canManage={data.canManage}
        />
        <MeetingAiOverviewCard aiMode={data.aiMode} />
        {data.canManage && (
          <MeetingJoinRequestsCard
            meetingId={meetingId}
            requests={data.pendingRequests}
          />
        )}
        {isCancelled && <CancelledState />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <CompletedState data={data} />}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isUpcoming && (
          <UpcomingState
            meetingId={meetingId}
            canManage={data.canManage}
          />
        )}
      </div>
    </>
  );
};

export const MeetingIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take a few seconds"
    />
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error Loading Meeting"
      description="Please try again later"
    />
  );
};
