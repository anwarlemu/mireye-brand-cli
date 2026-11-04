import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";

import { registryName, registryUrl } from "@www/lib/registry";
import { Providers } from "./providers";

import "./globals.css";

// Gilroy (Regular and Medium) is served from /fonts by the brand's fonts.css; DM Mono comes from Google.
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(registryUrl),
  title: { default: `${registryName} design system`, template: `%s | ${registryName} design system` },
  alternates: { types: { "text/markdown": "/agents.md", "text/plain": "/llms.txt" } },
  description: `Components, design tokens and CLI guidance for building ${registryName} interfaces.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmMono.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
