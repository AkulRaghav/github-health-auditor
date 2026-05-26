"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import { Trophy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  owner: string;
  repo: string;
  overallScore: number;
  grade: string;
  timestamp: string;
  shareId: string | null;
}

export default function LeaderboardPage() {
  const [repos, setRepos] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setRepos(d.repos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getMedal = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}`;
  };

  const getScoreColor = (s: number) => s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : s >= 40 ? "text-orange-500" : "text-red-500";

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <div className="relative mx-auto max-w-4xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-neutral-500">
            <Trophy className="h-4 w-4" />
            Public Leaderboard
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Healthiest Repositories</h1>
          <p className="mt-2 text-neutral-500">Repos ranked by health score — audit yours to join</p>
        </motion.div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          </div>
        )}

        {!loading && repos.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
            <p className="text-neutral-500">No audits yet. Be the first to audit a repo!</p>
            <Link href="/" className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2.5 text-sm text-white dark:from-cyan-500 dark:to-blue-600">
              Start Auditing
            </Link>
          </div>
        )}

        {repos.length > 0 && (
          <div className="space-y-2">
            {repos.map((repo, i) => (
              <motion.div
                key={`${repo.owner}/${repo.repo}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-none"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-lg font-bold dark:bg-white/[0.06]">
                  {getMedal(i)}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{repo.owner}/{repo.repo}</p>
                  <p className="text-xs text-neutral-500">{new Date(repo.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={cn("text-xl font-bold", getScoreColor(repo.overallScore))}>
                  {repo.overallScore}
                </span>
                <span className="text-sm text-neutral-400">{repo.grade}</span>
                {repo.shareId && (
                  <Link href={`/report/${repo.shareId}`} className="text-neutral-400 hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
