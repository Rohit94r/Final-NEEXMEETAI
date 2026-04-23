import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";

function getAuthBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? "https://neexmeet.com"
    : "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [polarClient()],
});
