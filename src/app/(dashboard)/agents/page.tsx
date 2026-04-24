"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { 
  AgentsView, 
  AgentsViewError, 
  AgentsViewLoading
} from "@/modules/agents/ui/views/agents-view";

const Page = () => {
  return (
    <>
      <AgentsListHeader />
      <Suspense fallback={<AgentsViewLoading />}>
        <ErrorBoundary fallback={<AgentsViewError />}>
          <AgentsView />
        </ErrorBoundary>
      </Suspense>
    </>
  );
};
 
export default Page;
