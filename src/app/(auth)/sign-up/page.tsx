import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";
interface Props {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const { callbackUrl } = await searchParams;

  return <SignUpView callbackUrl={callbackUrl} />
}
export default Page;
