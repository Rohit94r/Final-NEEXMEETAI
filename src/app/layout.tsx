import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/app/providers";

import "./globals.css";

const appSans = Plus_Jakarta_Sans({
  variable: "--font-app-sans",
  subsets: ["latin"],
  display: "swap",
});

const appMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NeexMeet — AI-Powered Team Execution System",
    template: "%s | NeexMeet",
  },
  description: "NeexMeet is an AI-powered team execution platform where every action is visible, trackable, and accountable. Rooms, Meetings, Workspace, Pulse, and Presence in one place.",
  keywords: ["AI meetings", "team collaboration", "task tracking", "meeting summary", "NeexMeet"],
  authors: [{ name: "NeexMeet" }],
  creator: "NeexMeet",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "NeexMeet — AI-Powered Team Execution System",
    description: "Every task has clear ownership. Every completion is tracked. Admin has full visibility.",
    siteName: "NeexMeet",
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
      <body className={`${appSans.variable} ${appMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
        <Script
          src="https://apnaai.online/chatBot.js"
          data-owner-id="usr_119633539883861273"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
