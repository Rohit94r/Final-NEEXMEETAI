import posthog from "posthog-js";

const posthogToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  "phc_wnNK7aCrkKPq3PiWGeGL7nfLkQBt4VU4cnNYfYsghte9";
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (posthogToken) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: "2026-01-30",
  });
}
