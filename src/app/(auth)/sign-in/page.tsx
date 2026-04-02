import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
interface Props {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const { callbackUrl } = await searchParams;

  return <SignInView callbackUrl={callbackUrl} />
}
export default Page;
