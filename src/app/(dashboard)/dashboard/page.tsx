"use client";

import { AuthGuard } from "@/components/auth-guard";
import { HomeView } from "@/modules/home/ui/views/home-view";

const Page = () => {
  return (
    <AuthGuard>
      <HomeView />
    </AuthGuard>
  );
};

export default Page;
