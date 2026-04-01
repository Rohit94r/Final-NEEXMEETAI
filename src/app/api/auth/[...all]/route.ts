export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { getMissingServerEnv } from "@/lib/env";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const missingAuthEnv = getMissingServerEnv([
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
]);

const handlers = missingAuthEnv.length === 0 ? toNextJsHandler(auth) : null;

function authNotConfiguredResponse() {
  return NextResponse.json(
    {
      error: `Authentication is not configured. Missing environment variables: ${missingAuthEnv.join(", ")}.`,
    },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  if (!handlers) {
    return authNotConfiguredResponse();
  }

  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (!handlers) {
    return authNotConfiguredResponse();
  }

  return handlers.POST(request);
}
