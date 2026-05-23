import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${brand.project.name} — ${brand.person.name}`,
  description: brand.project.tagline,
  authors: [{ name: brand.person.name, url: brand.links.portfolio }],
  creator: brand.person.name,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: brand.project.name,
    description: `${brand.project.tagline} · ${brand.person.name}`,
    type: "website",
    url: "https://raft-consensus-web.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="min-h-full bg-bg font-sans antialiased">{children}</body>
    </html>
  );
}
