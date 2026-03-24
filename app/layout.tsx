import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocDrift | Catch stale docs before merge",
  description:
    "DocDrift checks changed code against your docs and flags stale or missing documentation before merge.",
  keywords: "documentation, git, github actions, developer tools, stale docs, docdrift",
  openGraph: {
    title: "DocDrift | Catch stale docs before merge",
    description:
      "DocDrift checks changed code against your docs and flags stale or missing documentation before merge.",
    url: "https://docdrift-seven.vercel.app",
    siteName: "DocDrift",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
