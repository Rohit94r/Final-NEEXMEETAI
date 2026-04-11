import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { getOptionalServerEnv, getRequiredServerEnv } from "@/lib/env";

function getSocialProviders() {
  const githubClientId = getOptionalServerEnv("GITHUB_CLIENT_ID");
  const githubClientSecret = getOptionalServerEnv("GITHUB_CLIENT_SECRET");
  const googleClientId = getOptionalServerEnv("GOOGLE_CLIENT_ID");
  const googleClientSecret = getOptionalServerEnv("GOOGLE_CLIENT_SECRET");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: Record<string, any> = {};

  if (githubClientId && githubClientSecret) {
    providers.github = {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    };
  }

  if (googleClientId && googleClientSecret) {
    providers.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
    console.log("✓ Google provider loaded");
    console.log("  - Client ID:", googleClientId.substring(0, 20) + "...");
    console.log("  - Secret configured:", !!googleClientSecret);
  } else {
    console.warn("⚠ Google provider not configured");
    console.warn("  - GOOGLE_CLIENT_ID:", !!googleClientId);
    console.warn("  - GOOGLE_CLIENT_SECRET:", !!googleClientSecret);
  }

  return providers;
}

function createAuth() {
  const baseURL =
    getOptionalServerEnv("NEXT_PUBLIC_BETTER_AUTH_URL") || 
    (process.env.NODE_ENV === "production" ? "https://neexmeet.com" : "http://localhost:3000");

  const trustedOrigins = [
    baseURL,
    "capacitor://localhost",
    "http://localhost",
    "https://neexmeet.com",
    "https://www.neexmeet.com"
  ];
  
  // Add localhost in development
  if (process.env.NODE_ENV === "development") {
    trustedOrigins.push("http://localhost:3000");
  }

  console.log("🔐 Initializing Better Auth with baseURL:", baseURL);
  console.log("🌐 Trusted origins:", trustedOrigins);

  return betterAuth({
    secret: getRequiredServerEnv("BETTER_AUTH_SECRET"),
    baseURL,
    trustedOrigins: trustedOrigins,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: getSocialProviders(),
  });
}

export const auth = createAuth();

export async function getSessionOrNull(requestHeaders: Headers) {
  try {
    return await auth.api.getSession({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error("Failed to get session", error);
    return null;
  }
}
