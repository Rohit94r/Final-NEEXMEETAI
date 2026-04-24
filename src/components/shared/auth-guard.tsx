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
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const { data: session, isPending, isRefetching, refetch } = authClient.useSession();

  useEffect(() => {
    let retryTimer: number | undefined;

    if (isPending || isRefetching) {
      return undefined;
    }

    if (session) {
      window.sessionStorage.removeItem("authRedirectPending");
      setIsAuthorized(true);
      setSessionAttempts(0);
      return undefined;
    }

    const isFreshAuthRedirect =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem("authRedirectPending") === "true";
    const maxAttempts = isFreshAuthRedirect ? 20 : 4;

    if (sessionAttempts < maxAttempts) {
      retryTimer = window.setTimeout(() => {
        setSessionAttempts((attempts) => attempts + 1);
        void refetch();
      }, 250);

      return () => {
        if (retryTimer) {
          window.clearTimeout(retryTimer);
        }
      };
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("authRedirectPending");
      const postLogoutRedirect = window.sessionStorage.getItem("postLogoutRedirect");

      if (postLogoutRedirect) {
        window.sessionStorage.removeItem("postLogoutRedirect");
        router.replace(postLogoutRedirect);
        return undefined;
      }
    }

    const callbackUrl = pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : "";
    router.replace(`/sign-in${callbackUrl}`);
    return undefined;
  }, [isPending, isRefetching, pathname, refetch, router, session, sessionAttempts]);

  if (isPending || isRefetching || !isAuthorized) {
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
