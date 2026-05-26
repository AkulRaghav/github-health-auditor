"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import ScoreCircle from "@/components/ScoreCircle";
import { Building2, Loader2, Star, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgRepo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  score: number;
  grade: string;
  error?: string;
}

interface OrgResult {
  org: string;
  totalRepos: number;
  auditedCount: number;
  averageScore: number;
  repos: OrgRepo[];
}

export default function OrgPage() {
  const [orgName, setOrgName] = useState("");
  const [result, setResult] = useState<OrgResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/org/${encodeURIComponent(orgName.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to audit organization");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : score >= 40 ? "text-orange-500" : "text-red-500";
  const getScoreBg = (score: number) => score >= 80 ? "bg-green-500/10 border-green-500/20" : score >= 60 ? "bg-yellow-500/10 border-yellow-500/20" : score >= 40 ? "bg-orange-500/10 border-orange-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-neutral-500">
            <Building2 className="h-4 w-4" />
            Organization Dashboard
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">Audit an Organization</h1>
          <p className="mt-2 text-neutral-500">Scan all public repos in a GitHub org at once</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleAudit} className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Organization name (e.g. vercel)"
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white px-5 py-4 text-foreground placeholder-neutral-400 shadow-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-none dark:placeholder-neutral-500 dark:focus:border-cyan-500/30 dark:focus:ring-0"
          />
          <button
            type="submit"
            disabled={isLoading || !orgName.trim()}
            className={cn(
              "flex items-center gap-2 rounded-xl px-8 py-4 font-medium transition-all",
              isLoading ? "bg-neutral-100 text-neutral-400 dark:bg-white/[0.05]" : "bg-gradient-to-r from-orange-500 to-rose-500 text-white dark:from-cyan-500 dark:to-blue-600 hover:shadow-lg"
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            {isLoading ? "Scanning..." : "Audit Org"}
          </button>
        </motion.form>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-center text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center text-sm text-neutral-500">
            <p>Auditing up to 10 repos... This may take 30-60 seconds.</p>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Org summary */}
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
              <h2 className="text-xl font-bold">{result.org}</h2>
              <ScoreCircle score={result.averageScore} grade={result.averageScore >= 80 ? "A" : result.averageScore >= 60 ? "C" : "F"} size="md" />
              <div className="flex gap-6 text-sm text-neutral-500">
                <span>{result.totalRepos} total repos</span>
                <span>{result.auditedCount} audited</span>
                <span>Avg: {result.averageScore}/100</span>
              </div>
            </div>

            {/* Repo leaderboard */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none">
              <h3 className="mb-4 text-lg font-semibold">Repository Leaderboard</h3>
              <div className="space-y-3">
                {[...result.repos].sort((a, b) => b.score - a.score).map((repo, i) => (
                  <motion.div
                    key={repo.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-white/[0.04] dark:bg-white/[0.02]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-sm font-bold dark:bg-white/[0.06]">
                      {i + 1}
                    </span>
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", getScoreBg(repo.score))}>
                      <span className={cn("text-sm font-bold", getScoreColor(repo.score))}>{repo.score}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{repo.name}</p>
                      <p className="text-xs text-neutral-500 line-clamp-1">{repo.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      {repo.language && <span className="flex items-center gap-1"><Code className="h-3 w-3" />{repo.language}</span>}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
