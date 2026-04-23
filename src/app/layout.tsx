import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/app/providers";
import { SmoothScroll } from "@/app/smooth-scroll";

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
  metadataBase: new URL("https://neexmeet.com"),
  title: "NeexMeet – AI Meeting Notes & Task Execution Platform",
  description:
    "Turn meetings into tasks, summaries, and decisions automatically with AI-powered NeexMeet.",
  keywords: ["AI meetings", "team collaboration", "task tracking", "meeting summary", "NeexMeet"],
  authors: [{ name: "NeexMeet" }],
  creator: "NeexMeet",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "NeexMeet",
    description: "AI meeting to task execution platform",
    url: "https://neexmeet.com",
    siteName: "NeexMeet",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeexMeet",
    description: "AI meeting productivity platform",
    images: ["/og.png"],
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
        <SmoothScroll />
        <AppProviders>{children}</AppProviders>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="67785649-8b05-456b-a6a3-eeee21fef9ee"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
