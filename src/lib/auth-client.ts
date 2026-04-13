import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react";
import { ensureAbsoluteUrl } from "@/lib/url";

function getAuthBaseURL(): string {
  const envUrl = ensureAbsoluteUrl(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  const deployUrl = ensureAbsoluteUrl(process.env.URL) || ensureAbsoluteUrl(process.env.DEPLOY_URL);
  if (deployUrl) {
    return deployUrl;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://neexmeet.com";
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [polarClient()],
});
