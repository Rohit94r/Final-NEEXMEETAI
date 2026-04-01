"use client";

import { NuqsAdapter } from "nuqs/adapters/next";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        {children}
        <Toaster />
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
