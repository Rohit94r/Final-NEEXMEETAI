import type { Metadata } from "next";
import { AppProviders } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NeexMeetAI — AI-Powered Team Execution System",
    template: "%s | NeexMeetAI",
  },
  description: "NeexMeetAI is an AI-powered team execution platform where every action is visible, trackable, and accountable. Rooms, Meetings, Workspace, Pulse, and Presence in one place.",
  keywords: ["AI meetings", "team collaboration", "task tracking", "meeting summary", "NeexMeetAI"],
  authors: [{ name: "NeexMeetAI" }],
  creator: "NeexMeetAI",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "NeexMeetAI — AI-Powered Team Execution System",
    description: "Every task has clear ownership. Every completion is tracked. Admin has full visibility.",
    siteName: "NeexMeetAI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
