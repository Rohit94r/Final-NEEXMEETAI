"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  VideoIcon, 
  HomeIcon, 
  UsersIcon, 
  CheckSquareIcon,
  UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  {
    icon: HomeIcon,
    label: "Home",
    href: "/dashboard",
  },
  {
    icon: VideoIcon,
    label: "Meetings",
    href: "/meetings",
  },
  {
    icon: CheckSquareIcon,
    label: "Workspace",
    href: "/workspace",
  },
  {
    icon: UsersIcon,
    label: "Rooms",
    href: "/rooms",
  },
  {
    icon: UserIcon,
    label: "Profile",
    href: "/profile",
  },
];

export const BottomTabs = memo(function BottomTabs() {
  const pathname = usePathname();

  const isActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 safe-area-bottom pb-1">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-1 px-2 transition-all duration-300 touch-target flex-1 min-w-0",
                active ? "text-primary" : "text-gray-400"
              )}
            >
              <motion.div
                animate={active ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center"
              >
                <item.icon
                  className={cn(
                    "size-6 transition-colors duration-300",
                    active ? "fill-primary/10" : ""
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-semibold mt-0.5 tracking-tight transition-all duration-300",
                  active ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0.5"
                )}>
                  {item.label}
                </span>
              </motion.div>
              
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
