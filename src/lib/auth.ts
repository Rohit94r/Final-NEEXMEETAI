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

  return {
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : {}),
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
  };
}

function createAuth() {
  const baseURL =
    getOptionalServerEnv("NEXT_PUBLIC_BETTER_AUTH_URL") ?? "http://localhost:3000";

  return betterAuth({
    secret: getRequiredServerEnv("BETTER_AUTH_SECRET"),
    baseURL,
    trustedOrigins: [baseURL],
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
