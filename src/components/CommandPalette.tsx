"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, GitCompare, History, Building2, Trophy, LogIn, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  icon: typeof Search;
  action: () => void;
  shortcut?: string;
  category: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const commands: Command[] = [
    { id: "audit", label: "Audit a Repository", icon: Activity, action: () => { router.push("/"); setOpen(false); }, shortcut: "⌘1", category: "Navigation" },
    { id: "compare", label: "Compare Repositories", icon: GitCompare, action: () => { router.push("/compare"); setOpen(false); }, shortcut: "⌘2", category: "Navigation" },
    { id: "org", label: "Audit Organization", icon: Building2, action: () => { router.push("/org"); setOpen(false); }, shortcut: "⌘3", category: "Navigation" },
    { id: "leaderboard", label: "View Leaderboard", icon: Trophy, action: () => { router.push("/leaderboard"); setOpen(false); }, shortcut: "⌘4", category: "Navigation" },
    { id: "history", label: "Audit History", icon: History, action: () => { router.push("/history"); setOpen(false); }, shortcut: "⌘5", category: "Navigation" },
    { id: "login", label: "Sign In with GitHub", icon: LogIn, action: () => { router.push("/login"); setOpen(false); }, category: "Account" },
    { id: "theme-dark", label: "Switch to Dark Mode", icon: Moon, action: () => { setTheme("dark"); setOpen(false); }, category: "Preferences" },
    { id: "theme-light", label: "Switch to Light Mode", icon: Sun, action: () => { setTheme("light"); setOpen(false); }, category: "Preferences" },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  // Keyboard shortcut to open: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);

      // Number shortcuts when palette is closed
      if ((e.metaKey || e.ctrlKey) && !open) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
          e.preventDefault();
          const routes = ["/", "/compare", "/org", "/leaderboard", "/history"];
          router.push(routes[num - 1]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, router]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Arrow key navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIndex]) { filtered[selectedIndex].action(); }
  }, [filtered, selectedIndex]);

  return (
    <>
      {/* Trigger hint in navbar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-neutral-200 bg-white/50 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-white hover:text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:hover:text-neutral-300 md:flex"
      >
        <Search className="h-3 w-3" />
        <span>Search...</span>
        <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium dark:border-white/[0.1] dark:bg-white/[0.06]">⌘K</kbd>
      </button>

      {/* Palette overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-white/[0.1] dark:bg-neutral-900"
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-white/[0.08]">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-neutral-400"
                />
                <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] dark:border-white/[0.1] dark:bg-white/[0.06]">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-neutral-500">No results found</p>
                )}
                {filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      i === selectedIndex
                        ? "bg-neutral-100 text-foreground dark:bg-white/[0.08]"
                        : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <cmd.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{cmd.label}</span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] text-neutral-400">{cmd.shortcut}</kbd>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
