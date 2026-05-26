"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import { History, ExternalLink, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditRecord {
  id: string;
  owner: string;
  repo: string;
  repoUrl: string;
  overallScore: number;
  grade: string;
  timestamp: string;
  shareId: string | null;
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (res.status === 401) {
          setError("Sign in with GitHub to view your audit history.");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setAudits(data.audits || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    if (score >= 40) return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-4xl px-6 py-12"
      >
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-neutral-400">
            <History className="h-4 w-4" />
            Audit History
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Your Audits</h1>
          <p className="mt-2 text-neutral-400">Track repository health over time</p>
        </motion.div>

        {loading && (
          <motion.div variants={fadeUp} className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </motion.div>
        )}

        {error && (
          <motion.div variants={fadeUp} className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
            <p className="text-neutral-500">{error}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/[0.06] px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.1]"
            >
              Sign In with GitHub
            </Link>
          </motion.div>
        )}

        {!loading && !error && audits.length === 0 && (
          <motion.div variants={fadeUp} className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 text-4xl"
            >
              📋
            </motion.div>
            <p className="text-neutral-400">No audits yet. Run your first audit from the home page.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm text-white"
            >
              Start Auditing
            </Link>
          </motion.div>
        )}

        {audits.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {audits.map((audit, i) => (
              <motion.div
                key={audit.id}
                variants={fadeUp}
                whileHover={{ scale: 1.01, x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-colors hover:border-neutral-300 hover:shadow-md dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-none dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04]"
              >
                {/* Score badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200 }}
                  className={cn("flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border", getScoreBg(audit.overallScore))}
                >
                  <span className={cn("text-xl font-bold", getScoreColor(audit.overallScore))}>
                    {audit.overallScore}
                  </span>
                </motion.div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{audit.owner}/{audit.repo}</h3>
                    <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", getScoreColor(audit.overallScore))}>
                      {audit.grade}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(audit.timestamp).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {audit.shareId && (
                    <Link
                      href={`/report/${audit.shareId}`}
                      className="rounded-lg p-2 text-neutral-400 transition-all hover:bg-white/[0.06] hover:text-white group-hover:translate-x-0.5"
                      title="View report"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
