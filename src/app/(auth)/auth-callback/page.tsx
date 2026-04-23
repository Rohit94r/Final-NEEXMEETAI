"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2Icon, LoaderCircleIcon, OctagonAlertIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getSafeCallbackUrl } from "@/modules/auth/lib/callback-url";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForSession, setIsWaitingForSession] = useState(true);
  const [callbackUrl, setCallbackUrl] = useState("/dashboard");
  const [mode, setMode] = useState<"oauth" | "credentials" | "social">("oauth");
  const { data: session, isPending, isRefetching, refetch } = authClient.useSession();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");
    const code = params.get("code");
    const nextMode = params.get("mode");
    const nextCallbackUrl = getSafeCallbackUrl(params.get("callbackUrl") ?? undefined);

    setCallbackUrl(nextCallbackUrl);
    setMode(
      nextMode === "credentials" || nextMode === "social" ? nextMode : "oauth"
    );

    console.log("🔐 Auth Callback:", {
      error: errorParam,
      errorDescription,
      code: code ? "present" : "missing",
    });

    if (errorParam || errorDescription) {
      setError(
        `OAuth Error: ${errorParam || "unknown_error"}. ${errorDescription || ""}`
      );
      setIsWaitingForSession(false);
      return;
    }

    if (!code && nextMode !== "credentials" && nextMode !== "social") {
      setError("Authentication failed: No authorization code received");
      setIsWaitingForSession(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (error || isPending || isRefetching) {
      return;
    }

    if (session) {
      router.replace(callbackUrl);
      return;
    }

    void refetch();

    const timeout = window.setTimeout(() => {
      setIsWaitingForSession(false);
      setError(
        mode === "credentials" || mode === "social"
          ? "Sign-in completed, but we could not restore your session automatically. Please try again."
          : "Authentication completed, but we could not restore your session automatically. Please sign in again."
      );
    }, 6500);

    return () => window.clearTimeout(timeout);
  }, [callbackUrl, error, isPending, isRefetching, mode, refetch, router, session]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07110d] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,#07110d_0%,#0a1712_100%)]" />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-72 w-72 rounded-full bg-emerald-400/12 blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-white/6 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        {isWaitingForSession ? (
          <div className="text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-[24px] border border-emerald-300/25 bg-emerald-400/10 shadow-[0_0_50px_rgba(16,185,129,0.18)]">
              <LoaderCircleIcon className="size-9 animate-spin text-emerald-200" strokeWidth={2.4} />
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight">Opening your workspace</h1>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              We&apos;re restoring your secure session and preparing the dashboard.
            </p>
            <div className="mt-6 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              <CheckCircle2Icon className="size-3.5 text-emerald-300" />
              Auth handshake in progress
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert className="border-none bg-destructive/12 text-white">
              <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-white/70">
                <strong>Troubleshooting steps:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-white/65">
                <li>{`Clear your browser cookies and try again`}</li>
                <li>{`Make sure you're on https://neexmeet.com`}</li>
                <li>{`Check that your Google Client ID and Secret are correct`}</li>
                <li>{`Verify OAuth redirect URI in Google Cloud Console`}</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`)}
                className="flex-1 border-white/12 bg-white/5 text-white hover:bg-white/10"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-emerald-500 text-white hover:bg-emerald-400"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">Ready</h1>
            <p className="mb-4 text-white/70">
              Redirecting to your workspace...
            </p>
            <Button
              onClick={() => router.push(callbackUrl)}
              className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
