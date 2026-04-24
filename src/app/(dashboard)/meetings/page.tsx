
"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import {
  MeetingsView,
  MeetingsViewError,
  MeetingsViewLoading,
} from "@/modules/meetings/ui/views/meetings-view";

const Page = () => {
  return (
    <>
      <MeetingsListHeader />
      <Suspense fallback={<MeetingsViewLoading />}>
        <ErrorBoundary fallback={<MeetingsViewError />}>
          <MeetingsView />
        </ErrorBoundary>
      </Suspense>
    </>
  );
};

export default Page;
