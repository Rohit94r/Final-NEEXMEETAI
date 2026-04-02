import Link from "next/link";
import { ChevronRightIcon, TrashIcon, PencilIcon, MoreVerticalIcon, LinkIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMeetingShare } from "@/hooks/use-meeting-share";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Props {
  meetingId: string;
  meetingName: string;
  canManage: boolean;
  canShare: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onInvite: () => void;
}

export const MeetingIdViewHeader = ({
  meetingId,
  meetingName,
  canManage,
  canShare,
  onEdit,
  onRemove,
  onInvite,
}: Props) => {
  const handleCopyLink = useMeetingShare(meetingId);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <Breadcrumb>
               <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="font-medium text-xl">
              <Link href="/meetings">
                My Meetings
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
            <ChevronRightIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
              <Link href={`/meetings/${meetingId}`}>
                {meetingName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-2">
        {canShare && (
          <Button type="button" variant="outline" onClick={handleCopyLink}>
            <LinkIcon />
            Share link
          </Button>
        )}
        {canManage && (
          <Button type="button" onClick={onInvite}>
            <UserPlusIcon />
            Invite member
          </Button>
        )}
        {canManage && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <PencilIcon className="size-4 text-black" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRemove}>
                <TrashIcon className="size-4 text-black" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
