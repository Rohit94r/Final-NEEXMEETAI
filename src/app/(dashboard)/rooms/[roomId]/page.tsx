import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionOrNull } from "@/lib/auth";
import { RoomIdView } from "@/modules/rooms/ui/views/room-id-view";

interface Props {
  params: Promise<{ roomId: string }>;
}

const Page = async ({ params }: Props) => {
  const session = await getSessionOrNull(await headers());
  if (!session) redirect("/sign-in");
  const { roomId } = await params;
  return <RoomIdView roomId={roomId} />;
};

export default Page;
