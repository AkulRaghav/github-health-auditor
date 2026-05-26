"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ScoreCircle from "@/components/ScoreCircle";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import { GitCompare, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditResult } from "@/lib/analyzers";

const categoryMeta: Record<string, { name: string; icon: string }> = {
  commitFrequency: { name: "Commits", icon: "📝" },
  prMergeTime: { name: "PR Speed", icon: "🔀" },
  issueResponseTime: { name: "Issues", icon: "💬" },
  dependencyFreshness: { name: "Deps", icon: "📦" },
  testCoverage: { name: "CI/Tests", icon: "🧪" },
  documentation: { name: "Docs", icon: "📚" },
  security: { name: "Security", icon: "🔒" },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ComparePage() {
  const [repo1, setRepo1] = useState("");
  const [repo2, setRepo2] = useState("");
  const [result, setResult] = useState<{ repo1: AuditResult; repo2: AuditResult } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repo1.trim() || !repo2.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl1: repo1, repoUrl2: repo2 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-6 py-12"
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-neutral-400">
            <GitCompare className="h-4 w-4" />
            Side-by-Side Comparison
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Compare Repositories</h1>
          <p className="mt-2 text-neutral-400">See how two repos stack up against each other</p>
        </motion.div>

        {/* Compare Form */}
        <motion.form variants={fadeUp} onSubmit={handleCompare} className="mb-12">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <input
              type="text"
              value={repo1}
              onChange={(e) => setRepo1(e.target.value)}
              placeholder="owner/repo or full URL"
              className="w-full flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-4 text-foreground placeholder-neutral-400 shadow-sm outline-none transition-colors focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-none dark:placeholder-neutral-500 dark:focus:border-cyan-500/30 dark:focus:ring-0"
            />
            <ArrowRight className="h-5 w-5 rotate-90 text-neutral-400 md:rotate-0" />
            <input
              type="text"
              value={repo2}
              onChange={(e) => setRepo2(e.target.value)}
              placeholder="owner/repo or full URL"
              className="w-full flex-1 rounded-xl border border-neutral-200 bg-white px-5 py-4 text-foreground placeholder-neutral-400 shadow-sm outline-none transition-colors focus:border-violet-300 focus:ring-2 focus:ring-violet-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-none dark:placeholder-neutral-500 dark:focus:border-purple-500/30 dark:focus:ring-0"
            />
            <button
              type="submit"
              disabled={isLoading || !repo1.trim() || !repo2.trim()}
              className={cn(
                "flex items-center gap-2 rounded-xl px-8 py-4 font-medium transition-all",
                isLoading ? "bg-neutral-100 text-neutral-400 dark:bg-white/[0.05] dark:text-neutral-500" : "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/20"
              )}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
              Compare
            </button>
          </div>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-center text-sm text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Score comparison */}
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none p-8"
              >
                <h3 className="mb-4 text-lg font-semibold">{result.repo1.owner}/{result.repo1.repo}</h3>
                <ScoreCircle score={result.repo1.overallScore} grade={result.repo1.grade} size="md" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none p-8"
              >
                <h3 className="mb-4 text-lg font-semibold">{result.repo2.owner}/{result.repo2.repo}</h3>
                <ScoreCircle score={result.repo2.overallScore} grade={result.repo2.grade} size="md" />
              </motion.div>
            </div>

            {/* Category comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none p-8"
            >
              <h3 className="mb-6 text-lg font-semibold">Category Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(categoryMeta).map(([key, meta], i) => {
                  const s1 = result.repo1.categories[key as keyof typeof result.repo1.categories]?.score ?? 0;
                  const s2 = result.repo2.categories[key as keyof typeof result.repo2.categories]?.score ?? 0;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-right text-sm font-medium text-neutral-300">{s1}</span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s1}%` }}
                            transition={{ delay: 0.6 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex w-24 flex-col items-center text-center">
                        <span className="text-lg">{meta.icon}</span>
                        <span className="text-xs text-neutral-500">{meta.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s2}%` }}
                            transition={{ delay: 0.6 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          />
                        </div>
                        <span className="w-8 text-sm font-medium text-neutral-300">{s2}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-8 text-xs text-neutral-500">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                  {result.repo1.owner}/{result.repo1.repo}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  {result.repo2.owner}/{result.repo2.repo}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
