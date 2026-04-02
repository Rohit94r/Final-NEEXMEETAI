import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionOrNull } from "@/lib/auth";
import { WorkspaceView } from "@/modules/workspace/ui/views/workspace-view";

const Page = async () => {
  const session = await getSessionOrNull(await headers());
  if (!session) redirect("/sign-in");
  return <WorkspaceView />;
};

export default Page;
