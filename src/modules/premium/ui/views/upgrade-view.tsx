"use client";

import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

import { PricingCard } from "../components/pricing-card";

export const UpgradeView = () => {
  const trpc = useTRPC();

   const { data: products } = useSuspenseQuery(
    trpc.premium.getProducts.queryOptions()
  );

  useSuspenseQuery(trpc.premium.getCurrentSubscription.queryOptions());
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
          {products.map((product) => {
            const isCurrentProduct = product.id === "free";
            const isPremium = false;
            const isAvailable = (product as { isAvailable?: boolean }).isAvailable ?? false;

            let buttonText = isAvailable ? "Current Plan" : "Coming Soon";
            const onClick = () => {
              toast.message("Billing placeholder", {
                description: "Payment checkout will be connected in a future release.",
              });
            };

            if (isCurrentProduct) {
              buttonText = "Current Plan";
            } else if (isPremium) {
              buttonText = isAvailable ? "Manage Later" : "Coming Soon";
            }

            return (
              <PricingCard
                key={product.id}
                buttonText={buttonText}
                onClick={onClick}
                variant={
                  product.metadata.variant === "highlighted"
                    ? "highlighted"
                    : "default"
                }
                title={product.name}
                price={
                  product.prices[0].amountType === "fixed"
                    ? product.prices[0].priceAmount / 100
                    : 0
                }
                description={product.description}
                priceSuffix={`/${(product.prices[0] as unknown as Record<string, string>).recurringInterval ?? "month"}`}
                features={product.benefits.map(
                  (benefit) => benefit.description
                )}
                badge={product.metadata.badge as string | null}
                disabled={!isAvailable || isCurrentProduct}
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
