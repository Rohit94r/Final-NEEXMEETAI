"use client";

import { AuthGuard } from "@/components/shared/auth-guard";
import { RoomsView } from "@/modules/rooms/ui/views/rooms-view";

const Page = () => {
  return (
    <AuthGuard>
      <RoomsView />
    </AuthGuard>
  );
};

export default Page;
