"use client";

import { toast } from "sonner";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";

import { PricingCard } from "../components/pricing-card";

const placeholderPlans = [
  {
    id: "free",
    title: "Free",
    description: "Good for trying the product locally while billing is offline.",
    price: 0,
    priceSuffix: "/month",
    badge: "Current",
    variant: "default" as const,
    buttonText: "Current Plan",
    disabled: true,
    features: [
      "Create and run meetings without billing limits",
      "Create AI agents",
      "Use host approval for join requests",
    ],
  },
  {
    id: "pro",
    title: "Pro",
    description: "Reserved for future Stripe or Polar checkout integration.",
    price: 19,
    priceSuffix: "/month",
    badge: "Coming Soon",
    variant: "highlighted" as const,
    buttonText: "Coming Soon",
    disabled: true,
    features: [
      "Advanced meeting analytics",
      "Priority AI processing",
      "More automation controls",
    ],
  },
  {
    id: "business",
    title: "Business",
    description: "Placeholder tier for team billing and admin features.",
    price: 49,
    priceSuffix: "/month",
    badge: null,
    variant: "default" as const,
    buttonText: "Coming Soon",
    disabled: true,
    features: [
      "Workspace-level controls",
      "Usage reporting",
      "Future team billing support",
    ],
  },
];

export const UpgradeView = () => {
  const currentPlanName = "Free";

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-10">
      <div className="mt-4 flex-1 flex flex-col gap-y-10 items-center">
        <h5 className="font-medium text-2xl md:text-3xl">
          You are on the{" "}
          <span className="font-semibold text-primary">
            {currentPlanName}
          </span>{" "}
          plan
        </h5>
        <p className="max-w-2xl text-center text-sm text-muted-foreground">
          Billing is intentionally disabled for now. This page keeps the plan
          structure ready for a future Stripe or Polar integration without
          turning payments on yet.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {placeholderPlans.map((plan) => {
            const onClick = () => {
              toast.message("Billing placeholder", {
                description: "Payment checkout will be connected in a future release.",
              });
            };

            return (
              <PricingCard
                key={plan.id}
                buttonText={plan.buttonText}
                onClick={onClick}
                variant={plan.variant}
                title={plan.title}
                price={plan.price}
                description={plan.description}
                priceSuffix={plan.priceSuffix}
                features={plan.features}
                badge={plan.badge}
                disabled={plan.disabled}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
};

export const UpgradeViewLoading = () => {
  return (
    <LoadingState title="Loading" description="This may take a few seconds" />
  );
};

export const UpgradeViewError = () => {
  return <ErrorState title="Error" description="Please try again later" />;
};
