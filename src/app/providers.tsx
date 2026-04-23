"use client";

import { NuqsAdapter } from "nuqs/adapters/next";

import { Toaster } from "@/components/ui/sonner";
import { SmoothScrollProvider } from "@/components/shared/smooth-scroll-provider";
import { TRPCReactProvider } from "@/trpc/client";

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Toaster />
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
