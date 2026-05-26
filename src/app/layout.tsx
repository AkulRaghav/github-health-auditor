import type { Metadata } from "next";
import Providers from "@/components/Providers";
import SquircleFilter from "@/components/SquircleFilter";
import CursorCat from "@/components/CursorCat";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoHealth — GitHub Repository Health Auditor",
  description:
    "Audit any GitHub repository across 7 dimensions: commits, PRs, issues, dependencies, CI/CD, documentation, and security. Includes vulnerability scanning, auto-fix generation, and shareable reports.",
  openGraph: {
    title: "RepoHealth — GitHub Repository Health Auditor",
    description: "Complete health analysis for any GitHub repository",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SquircleFilter />
        <CursorCat />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
