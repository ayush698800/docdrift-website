import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";


const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DocDrift — Your docs should never lie again",
  description: "DocDrift finds stale documentation in your codebase and fixes it automatically using AI. No more outdated READMEs.",
  keywords: "documentation, AI, git, developer tools, stale docs",
  openGraph: {
    title: "DocDrift — Your docs should never lie again",
    description: "Finds stale documentation and fixes it automatically using AI",
    url: "https://docdrift.vercel.app",
    siteName: "DocDrift",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrains.variable}`}>
      <body style={{ fontFamily: "var(--font-sans)" }}>{children}</body>
    </html>
  );
}