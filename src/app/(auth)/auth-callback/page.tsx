"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OctagonAlertIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const code = searchParams.get("code");

    console.log("🔐 Auth Callback:", {
      error: errorParam,
      errorDescription,
      code: code ? "present" : "missing",
    });

    if (errorParam || errorDescription) {
      setError(
        `OAuth Error: ${errorParam || "unknown_error"}. ${errorDescription || ""}`
      );
      setIsLoading(false);
      return;
    }

    // If we're here without an error and no code, something went wrong
    if (!code) {
      setError("Authentication failed: No authorization code received");
      setIsLoading(false);
      return;
    }

    // Successfully got the code, better-auth should handle the rest
    // Wait a moment for the callback to complete
    const timeout = setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard
      router.push("/dashboard/meetings");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Completing Sign In</h1>
            <p className="text-muted-foreground">
              Please wait while we authenticate you...
            </p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert className="bg-destructive/10 border-none">
              <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Troubleshooting steps:</strong>
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>{`Clear your browser cookies and try again`}</li>
                <li>{`Make sure you're on https://neexmeet.com`}</li>
                <li>{`Check that your Google Client ID and Secret are correct`}</li>
                <li>{`Verify OAuth redirect URI in Google Cloud Console`}</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/sign-in")}
                className="flex-1"
              >
                Back to Sign In
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ready</h1>
            <p className="text-muted-foreground mb-4">
              Redirecting to dashboard...
            </p>
            <Button
              onClick={() => router.push("/dashboard/meetings")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
