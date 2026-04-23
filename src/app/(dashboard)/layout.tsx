"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { MobileHeader } from "@/components/navigation/mobile/mobile-header";
import { BottomTabs } from "@/components/navigation/mobile/bottom-tabs";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  const isMobile = useIsMobile();

  // Mobile Native-Like Experience
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <MobileHeader />
        <main className="flex-1 pb-20 overflow-y-auto">
          {children}
        </main>
        <BottomTabs />
      </div>
    );
  }

  // Desktop Experience
  return ( 
    <SidebarProvider>
      <DashboardSidebar />
      <main className="flex flex-col h-screen w-screen bg-muted overflow-hidden">
        <DashboardNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
};
 
export default Layout;
