import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionOrNull } from "@/lib/auth";
import { RoomsView } from "@/modules/rooms/ui/views/rooms-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getSessionOrNull(await headers());
  if (!session) redirect("/sign-in");
  return <RoomsView />;
};

export default Page;
