import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";

import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from "../constants";

export const SUBSCRIPTION_PLACEHOLDER_PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Best for trying the product and running a few meetings.",
    price: 0,
    interval: "month",
    badge: null,
    variant: "default" as const,
    features: [
      `${MAX_FREE_MEETINGS} meetings`,
      `${MAX_FREE_AGENTS} agents`,
      "Basic meeting management",
    ],
    isAvailable: true,
  },
  {
    id: "pro-placeholder",
    name: "Pro",
    description: "Reserved for future Stripe or Polar billing integration.",
    price: 19,
    interval: "month",
    badge: "Coming Soon",
    variant: "highlighted" as const,
    features: [
      "Higher meeting limits",
      "More AI agents",
      "Priority support and billing portal",
    ],
    isAvailable: false,
  },
] as const;

export async function getFreeUsageCounts(userId: string) {
  const [userMeetings] = await db
    .select({ count: count(meetings.id) })
    .from(meetings)
    .where(eq(meetings.userId, userId));

  const [userAgents] = await db
    .select({ count: count(agents.id) })
    .from(agents)
    .where(eq(agents.userId, userId));

  return {
    meetingCount: userMeetings.count,
    agentCount: userAgents.count,
  };
}

export async function getSubscriptionState() {
  /**
   * Placeholder billing implementation.
   *
   * We are intentionally not enabling real payments yet.
   * When you are ready to integrate Stripe or Polar:
   * 1. Replace this function with a real customer/subscription lookup.
   * 2. Keep the return shape stable so the UI and route guards do not change.
   * 3. Wire checkout/customer portal actions in the upgrade view.
   */
  return {
    provider: "placeholder" as const,
    currentPlan: null,
    isPremium: false,
    plans: SUBSCRIPTION_PLACEHOLDER_PLANS,
  };
}

export async function getEntityCreationAccess(
  userId: string,
  entity: "meetings" | "agents",
) {
  const [usage, subscription] = await Promise.all([
    getFreeUsageCounts(userId),
    getSubscriptionState(),
  ]);

  const isFreeMeetingLimitReached =
    usage.meetingCount >= MAX_FREE_MEETINGS;
  const isFreeAgentLimitReached = usage.agentCount >= MAX_FREE_AGENTS;

  const isBlocked =
    !subscription.isPremium &&
    ((entity === "meetings" && isFreeMeetingLimitReached) ||
      (entity === "agents" && isFreeAgentLimitReached));

  return {
    usage,
    subscription,
    isBlocked,
  };
}
