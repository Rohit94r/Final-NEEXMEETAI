import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";

function getAuthBaseURL(): string {
  const envUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  
  // Force production URL for native builds to prevent loop
  if (process.env.NODE_ENV === "production") {
    return envUrl || "https://neexmeet.com";
  }

  // In development, use current window origin or fallback
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [polarClient()],
});
