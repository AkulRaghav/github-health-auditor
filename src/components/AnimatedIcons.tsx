"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated arrow icon — extends a line on hover, indicating "go" or "start"
 * Used for CTA buttons and action triggers
 */
export function ArrowActionIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group flex size-full cursor-pointer items-center justify-center",
        className
      )}
    >
      <div className="relative grid cursor-pointer items-center justify-center">
        <ChevronRight className="h-5 w-5 transition-all duration-500 ease-out group-hover:translate-x-0.5" />
        <div className="absolute right-[9px] h-[2px] w-3 origin-right scale-x-0 rounded-[1px] bg-current transition-all duration-300 ease-out group-hover:right-[7px] group-hover:scale-x-100" />
      </div>
    </div>
  );
}

/**
 * Hamburger/X toggle — smooth animated transition between menu and close states
 * Used in mobile navigation
 */
export function MenuToggleIcon({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]",
        className
      )}
    >
      <div className="relative grid size-4 items-center justify-center">
        <motion.div
          animate={{ y: isOpen ? 0 : "-5px", rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        />
        <motion.div
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.1 }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        />
        <motion.div
          animate={{ y: isOpen ? 0 : "5px", rotate: isOpen ? -45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute h-0.5 w-full rounded-full bg-current"
        />
      </div>
    </div>
  );
}

/**
 * Scan/pulse icon — animated radar pulse effect
 * Used to indicate "scanning" or "auditing" state
 */
export function ScanPulseIcon({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
    >
      {/* Pulse rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute h-full w-full rounded-full border border-cyan-400/30"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute h-full w-full rounded-full border border-cyan-400/20"
            animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />
        </>
      )}
      {/* Center dot */}
      <motion.div
        className="h-3 w-3 rounded-full bg-cyan-400"
        animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={isActive ? { duration: 1, repeat: Infinity } : {}}
      />
    </div>
  );
}

/**
 * Shield check icon — animated checkmark appears on click
 * Used for security status indicators
 */
export function ShieldCheckIcon({
  checked,
  onClick,
  className,
}: {
  checked: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex size-full cursor-pointer items-center justify-center",
        className
      )}
    >
      <motion.div
        className="relative flex h-8 w-8 items-center justify-center"
        animate={{ rotate: checked ? [0, -10, 5, 0] : 0 }}
        transition={{ duration: 0.4 }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
            fill={checked ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)"}
            stroke={checked ? "#22c55e" : "#666"}
            strokeWidth="1.5"
          />
          {/* Animated checkmark */}
          <motion.path
            d="M8 12.5l2.5 2.5 5-5"
            stroke={checked ? "#22c55e" : "transparent"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * Score counter icon — animated number that counts up
 * Used in dashboard cards
 */
export function ScoreCounterIcon({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : score >= 40 ? "text-orange-400" : "text-red-400";
  const bgColor = score >= 80 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : score >= 40 ? "bg-orange-400" : "bg-red-400";

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <motion.div
        className={cn("h-2 w-2 rounded-full", bgColor)}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.span
        className={cn("text-sm font-bold tabular-nums", color)}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {score}
      </motion.span>
    </div>
  );
}
