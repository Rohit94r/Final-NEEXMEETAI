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
    default: "NeexMeet — Turn Meetings Into Execution",
    template: "%s | NeexMeet",
  },
  description: "NeexMeet turns meetings into summaries, decisions, tasks, and follow-ups automatically, so teams never miss what matters.",
  keywords: ["AI meetings", "team collaboration", "task tracking", "meeting summary", "NeexMeet"],
  authors: [{ name: "NeexMeet" }],
  creator: "NeexMeet",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "NeexMeet — Turn Meetings Into Execution",
    description: "AI-powered meeting summaries, decisions, tasks, and follow-ups in one workspace.",
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
