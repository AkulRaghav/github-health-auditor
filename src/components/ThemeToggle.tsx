"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated theme toggle with View Transitions API.
 * Adapted from Skiper26 — circle-expand reveal animation on theme switch.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setIsDark(resolvedTheme === "dark");
    }
  }, [resolvedTheme, mounted]);

  const toggleTheme = useCallback(() => {
    const newTheme = isDark ? "light" : "dark";

    const switchTheme = () => {
      setTheme(newTheme);
      setIsDark(!isDark);
    };

    // Check if View Transitions API is available
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document
    ) {
      // Inject transition styles
      const styleId = "theme-transition-styles";
      let el = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.id = styleId;
        document.head.appendChild(el);
      }
      el.textContent = `
        ::view-transition-group(root) {
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        ::view-transition-new(root) {
          animation-name: theme-reveal;
        }
        ::view-transition-old(root) {
          animation: none;
          z-index: -1;
        }
        @keyframes theme-reveal {
          from { clip-path: circle(0% at 50% 3%); }
          to { clip-path: circle(150% at 50% 3%); }
        }
      `;

      (document as any).startViewTransition(switchTheme);
    } else {
      switchTheme();
    }
  }, [isDark, setTheme]);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition-all duration-200 hover:bg-white/[0.15] active:scale-90 dark:border-white/10 dark:bg-white/[0.06]",
        "light:border-neutral-200 light:bg-neutral-100",
        className
      )}
      aria-label="Toggle theme"
    >
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
        <motion.g
          animate={{ rotate: isDark ? -180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          <path
            d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
            className="fill-white dark:fill-white"
          />
          <path
            d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
            className="fill-neutral-900 dark:fill-neutral-900"
          />
        </motion.g>
        <motion.path
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
          d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
          className="fill-white dark:fill-white"
        />
      </svg>
    </button>
  );
}
