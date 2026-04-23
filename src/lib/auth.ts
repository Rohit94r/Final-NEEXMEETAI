import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { user, session, account, verification } from "@/db/schema";
import { getOptionalServerEnv, getRequiredServerEnv } from "@/lib/env";
import { ensureAbsoluteUrl } from "@/lib/url";

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
  const envBaseURL = ensureAbsoluteUrl(getOptionalServerEnv("NEXT_PUBLIC_BETTER_AUTH_URL"));
  const vercelURL = ensureAbsoluteUrl(process.env.VERCEL_URL);
  const fallbackBaseURL =
    process.env.NODE_ENV === "production" ? "https://neexmeet.com" : "http://localhost:3000";

  const fallbackURL = envBaseURL || vercelURL || fallbackBaseURL;
  const productionHosts = [
    "neexmeet.com",
    "www.neexmeet.com",
    ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
  ];
  const baseURL =
    process.env.NODE_ENV === "production"
      ? {
          allowedHosts: productionHosts,
          fallback: fallbackURL,
        }
      : fallbackURL;

  const fallbackOrigins = [
    fallbackURL,
    envBaseURL,
    vercelURL,
    "capacitor://localhost",
    "http://localhost",
    "https://neexmeet.com",
    "https://www.neexmeet.com",
  ];

  const trustedOriginsSet = new Set<string>(
    fallbackOrigins.filter((url): url is string => typeof url === "string" && url.length > 0)
  );

  if (process.env.NODE_ENV === "development") {
    trustedOriginsSet.add("http://localhost:3000");
  }

  const trustedOrigins = Array.from(trustedOriginsSet).filter(Boolean);

  console.log("🔐 Initializing Better Auth with baseURL:", baseURL);
  console.log("🌐 Trusted origins:", trustedOrigins);

  return betterAuth({
    secret: getRequiredServerEnv("BETTER_AUTH_SECRET"),
    baseURL,
    trustedOrigins: trustedOrigins,
    session: {
      // Keep users signed in for 30 days and refresh active sessions daily.
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      crossSubDomainCookies:
        process.env.NODE_ENV === "production"
          ? {
              enabled: true,
              domain: ".neexmeet.com",
            }
          : undefined,
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
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
