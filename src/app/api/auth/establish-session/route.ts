import { createHmac } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { session } from "@/db/schema";
import { getRequiredServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

function signCookieValue(value: string) {
  const signature = createHmac("sha256", getRequiredServerEnv("BETTER_AUTH_SECRET"))
    .update(value)
    .digest("base64");

  return encodeURIComponent(`${value}.${signature}`);
}

function buildSessionCookie(value: string) {
  const attributes = [
    `${COOKIE_NAME}=${signCookieValue(value)}`,
    `Max-Age=${SESSION_MAX_AGE}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function buildLegacyDomainCookieCleanup() {
  return [
    `${COOKIE_NAME}=`,
    "Max-Age=0",
    "Path=/",
    "Domain=.neexmeet.com",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing session token" }, { status: 400 });
  }

  const [existingSession] = await db
    .select({ token: session.token })
    .from(session)
    .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
    .limit(1);

  if (!existingSession) {
    return NextResponse.json({ ok: false, error: "Invalid session token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", buildLegacyDomainCookieCleanup());
  response.headers.append("Set-Cookie", buildSessionCookie(existingSession.token));

  return response;
}
