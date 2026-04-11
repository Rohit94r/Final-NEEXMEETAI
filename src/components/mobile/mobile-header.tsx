"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon, BellIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const MobileHeader = memo(function MobileHeader() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
          <Image src="/logo.png" alt="NeexMeet" width={28} height={28} className="h-7 w-7" />
          <span className="font-bold text-lg tracking-tight">NeexMeet</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-10 rounded-full" asChild>
            <Link href="/search">
              <SearchIcon className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="size-10 rounded-full" asChild>
            <Link href="/notifications">
              <BellIcon className="size-5" />
            </Link>
          </Button>
          <Link href="/profile" className="ml-1 active:scale-95 transition-transform">
            {session?.user?.image ? (
              <Avatar className="size-8 border-2 border-primary/20 p-0.5">
                <AvatarImage src={session.user.image} />
              </Avatar>
            ) : (
              <GeneratedAvatar
                seed={session?.user?.name ?? "Guest"}
                variant="initials"
                className="size-8 rounded-full border-2 border-primary/20"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
});
