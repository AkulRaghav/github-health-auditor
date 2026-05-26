"use client";

import { useState } from "react";
import Link from "next/link";
import { NavLink, SlideLink } from "./AnimatedLink";
import { MenuToggleIcon } from "./AnimatedIcons";
import CommandPalette from "./CommandPalette";
import { Activity, GitCompare, History, LogIn, Building2, Trophy, FolderGit2 } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Audit", icon: Activity },
    { href: "/repos", label: "My Repos", icon: FolderGit2 },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/org", label: "Org", icon: Building2 },
    { href: "/leaderboard", label: "Ranks", icon: Trophy },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600" style={{ filter: "url(#squircle-sm)" }}>
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">RepoHealth</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
          <SlideLink
            href="/login"
            className="ml-3 rounded-lg text-sm text-neutral-600 dark:text-neutral-300"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </SlideLink>
          <CommandPalette />
        </div>

        {/* Mobile toggle — animated hamburger/X */}
        <div className="text-neutral-400 md:hidden">
          <MenuToggleIcon
            isOpen={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.06] px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-neutral-300 hover:bg-white/[0.06]"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg bg-white/[0.06] px-4 py-3 text-neutral-300"
          >
            <LogIn className="h-4 w-4" />
            Sign In with GitHub
          </Link>
        </div>
      )}
    </nav>
  );
}
