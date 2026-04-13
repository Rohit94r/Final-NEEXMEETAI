"use client";

import { AuthGuard } from "@/components/auth-guard";
import { WorkspaceView } from "@/modules/workspace/ui/views/workspace-view";

const Page = () => {
  return (
    <AuthGuard>
      <WorkspaceView />
    </AuthGuard>
  );
};

export default Page;
