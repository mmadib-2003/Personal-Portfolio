import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { getProfile } from "@/lib/queries";

const SITE_URL = "https://personalportfolio-rust-nu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muntasir Adib — Aspiring Cybersecurity Analyst (SOC / Blue Team)",
    template: "%s · Muntasir Adib",
  },
  description:
    "Portfolio of Muntasir Adib, an aspiring Cybersecurity Analyst focused on SOC operations, threat detection, network traffic monitoring and incident response triage.",
  keywords: [
    "Muntasir Adib",
    "Cybersecurity Analyst",
    "SOC Analyst",
    "Blue Team",
    "Threat Detection",
    "Incident Response",
    "Wireshark",
    "SIEM",
  ],
  authors: [{ name: "Muntasir Adib", url: "https://github.com/mmadib-2003" }],
  creator: "Muntasir Adib",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Muntasir Adib — SOC Portfolio",
    title: "Muntasir Adib — Aspiring Cybersecurity Analyst",
    description:
      "Blue-team focused portfolio: SOC triage playbooks, packet analysis labs and defensive tooling.",
    images: [
      {
        url: "/muntasir-adib.jpg",
        width: 800,
        height: 800,
        alt: "Portrait of Muntasir Adib",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Muntasir Adib — Aspiring Cybersecurity Analyst",
    description:
      "SOC operations · threat detection · incident response triage.",
    images: ["/muntasir-adib.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#060809" },
    { media: "(prefers-color-scheme: light)", color: "#f4f6f4" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: profile } = await getProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter profile={profile} />
          <ChatWidget profile={profile} />
        </ThemeProvider>
      </body>
    </html>
  );
}
