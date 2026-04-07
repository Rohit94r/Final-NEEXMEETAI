import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";

function getAuthBaseURL(): string {
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  
  // In production, we should have the environment variable set
  if (envUrl) {
    return envUrl;
  }

  // In development or if env var is not set
  if (typeof window !== "undefined") {
    // Client-side: use current window origin
    return window.location.origin;
  }

  // Fallback for SSR/build time
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [polarClient()],
});
