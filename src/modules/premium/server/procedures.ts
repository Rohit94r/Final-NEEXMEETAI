import {
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  getFreeUsageCounts,
  getSubscriptionState,
} from "../lib/subscription";

export const premiumRouter = createTRPCRouter({
  getCurrentSubscription: protectedProcedure.query(async () => {
    const subscription = await getSubscriptionState();

    return subscription.currentPlan;
  }),
  getProducts: protectedProcedure.query(async () => {
    const subscription = await getSubscriptionState();

    return subscription.plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      metadata: {
        variant: plan.variant,
        badge: plan.badge,
        isPlaceholder: true,
      },
      prices: [
        {
          amountType: "fixed" as const,
          priceAmount: plan.price * 100,
          recurringInterval: plan.interval,
        },
      ],
      benefits: plan.features.map((feature) => ({
        description: feature,
      })),
      isAvailable: plan.isAvailable,
    }));
  }),
  getFreeUsage: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getSubscriptionState();

    if (subscription.isPremium) {
      return null;
    }

    return getFreeUsageCounts(ctx.auth.user.id);
  })
});
