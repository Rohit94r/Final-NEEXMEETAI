"use client";

import { useEffect, useState, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = memo(function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        const callbackUrl = pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : "";
        router.replace(`/sign-in${callbackUrl}`);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isPending, pathname, router]);

  if (isPending || !isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-16 rounded-[2rem] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
          <LoaderIcon className="size-8 animate-spin text-primary" strokeWidth={3} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-black text-gray-900 tracking-tight">Authenticating</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Verifying Secure Session</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
});
