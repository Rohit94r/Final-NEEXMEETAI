export const dynamic = "force-dynamic";

import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { meetingsProcessing } from "@/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    meetingsProcessing,
  ],
});

const methodNotAllowed = () =>
  new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "GET, POST, PUT",
    },
  });

export const PATCH = methodNotAllowed;
export const OPTIONS = methodNotAllowed;
export const DELETE = methodNotAllowed;
                  
