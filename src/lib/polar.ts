import { Polar } from "@polar-sh/sdk";
import { getOptionalServerEnv } from "@/lib/env";

export const polarClient = new Polar({
  accessToken: getOptionalServerEnv("POLAR_ACCESS_TOKEN"),
  server: "sandbox",
});
