"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  stat: string;
}

const features: FeatureItem[] = [
  {
    icon: "📝",
    title: "Commits",
    description: "Analyzes commit frequency, contributor spread, and activity patterns over 90 days",
    color: "from-cyan-500/20 to-blue-500/20",
    stat: "90 days",
  },
  {
    icon: "🔀",
    title: "PR Speed",
    description: "Measures average merge time, stale PRs, review process, and merge ratios",
    color: "from-purple-500/20 to-pink-500/20",
    stat: "30 PRs",
  },
  {
    icon: "💬",
    title: "Issues",
    description: "Tracks first response time, close rates, label usage, and issue management",
    color: "from-green-500/20 to-emerald-500/20",
    stat: "8 sampled",
  },
  {
    icon: "📦",
    title: "Dependencies",
    description: "Checks freshness, lock files, deprecated packages, and automated update tools",
    color: "from-orange-500/20 to-amber-500/20",
    stat: "All deps",
  },
  {
    icon: "🧪",
    title: "CI/CD",
    description: "Detects pipelines, test frameworks, coverage tools, and build configurations",
    color: "from-blue-500/20 to-indigo-500/20",
    stat: "7 CI tools",
  },
  {
    icon: "📚",
    title: "Docs",
    description: "Scores README completeness, sections, code examples, contributing guides, and license",
    color: "from-yellow-500/20 to-orange-500/20",
    stat: "8 sections",
  },
  {
    icon: "🔒",
    title: "Security",
    description: "Scans for exposed secrets, .gitignore coverage, security policies, and CodeQL",
    color: "from-red-500/20 to-rose-500/20",
    stat: "6 checks",
  },
  {
    icon: "🛡️",
    title: "Vulns",
    description: "Queries OSV database for known CVEs across all dependencies with fix suggestions",
    color: "from-teal-500/20 to-cyan-500/20",
    stat: "OSV API",
  },
  {
    icon: "🔧",
    title: "Auto-Fix",
    description: "Generates CI workflows, Dependabot config, security policies, and PR templates",
    color: "from-violet-500/20 to-purple-500/20",
    stat: "8 files",
  },
];

export default function FeatureExpand({ className }: { className?: string }) {
  const [activeIndex, setActiveIndex] = useState<number>(4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn("relative w-full max-w-5xl px-4", className)}
    >
      <div className="flex w-full items-center justify-center gap-1.5 md:gap-2">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
            animate={{
              width: activeIndex === index ? "16rem" : "3.5rem",
              height: "18rem",
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => setActiveIndex(index)}
            onHoverStart={() => setActiveIndex(index)}
          >
            {/* Background gradient */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "absolute inset-0 bg-gradient-to-b",
                    feature.color
                  )}
                />
              )}
            </AnimatePresence>

            {/* Collapsed state — vertical icon */}
            <AnimatePresence>
              {activeIndex !== index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col items-center justify-center gap-3"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-[10px] font-medium tracking-wide text-neutral-500 [writing-mode:vertical-lr]">
                    {feature.title}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded state — full content */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative flex h-full flex-col justify-between p-5"
                >
                  <div>
                    <span className="text-3xl">{feature.icon}</span>
                    <h3 className="mt-3 text-lg font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-xs text-neutral-400">
                      {feature.stat}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {index + 1}/{features.length}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
