import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionOrNull } from "@/lib/auth";
import { HomeView } from "@/modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getSessionOrNull(await headers());

  if (!session) {
    redirect("/sign-in");
  }

  // Redirect to meetings page for default dashboard view
  redirect("/dashboard/meetings");
};

export default Page;
