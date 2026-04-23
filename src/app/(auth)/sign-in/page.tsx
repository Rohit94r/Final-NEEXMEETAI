import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { getSessionOrNull } from "@/lib/auth";

interface Props {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const { callbackUrl } = await searchParams;
  const session = await getSessionOrNull(await headers());

  if (session) {
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
  }

  return <SignInView callbackUrl={callbackUrl} />
}
export default Page;
