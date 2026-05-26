"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FloatingCodeCanvas from "@/components/FloatingCodeCanvas";
import { FolderGit2, Lock, GitFork, Star, Code, Loader2, Play, Zap, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Repo {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  isPrivate: boolean;
  updatedAt: string;
  url: string;
  isFork: boolean;
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219",
  "C#": "#178600", Ruby: "#701516", PHP: "#4F5D95",
  Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
  C: "#555555", "C++": "#f34b7d",
};

export default function MyReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditingRepo, setAuditingRepo] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "private" | "forks">("all");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/my-repos")
      .then((r) => {
        if (r.status === 401) throw new Error("Sign in to view your repositories");
        if (!r.ok) throw new Error("Failed to fetch repos");
        return r.json();
      })
      .then((d) => setRepos(d.repos || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAudit = (repo: Repo) => {
    setAuditingRepo(repo.fullName);
    router.push(`/?audit=${encodeURIComponent(repo.url)}`);
  };

  const filtered = repos.filter((r) => {
    if (filter === "public") return !r.isPrivate;
    if (filter === "private") return r.isPrivate;
    if (filter === "forks") return r.isFork;
    return true;
  });

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground">
      <Navbar />
      <FloatingCodeCanvas />

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20"
          >
            <FolderGit2 className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold md:text-4xl">Your Projects</h1>
          <p className="mt-2 text-neutral-500">Click any repo to start a health audit instantly</p>
        </motion.div>

        {/* Filters */}
        {!loading && !error && repos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex items-center justify-center gap-2"
          >
            {(["all", "public", "private", "forks"] as const).map((f) => {
              const count = f === "all" ? repos.length : repos.filter((r) => f === "public" ? !r.isPrivate : f === "private" ? r.isPrivate : r.isFork).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm font-medium capitalize transition-all duration-200",
                    filter === f
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 dark:from-cyan-500 dark:to-blue-600"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.08]"
                  )}
                >
                  {f} ({count})
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-10 w-10 text-cyan-400" />
            </motion.div>
            <p className="mt-4 text-sm text-neutral-500">Fetching your repositories...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-xl dark:border-white/[0.08] dark:bg-neutral-900"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
              <FolderGit2 className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              Sign In with GitHub
            </Link>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-neutral-300 bg-white/50 p-16 text-center dark:border-white/[0.1] dark:bg-white/[0.02]"
          >
            <p className="text-neutral-500">No repositories found for this filter.</p>
          </motion.div>
        )}

        {/* Repo Grid */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((repo, i) => (
              <motion.div
                key={repo.fullName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => handleAudit(repo)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl dark:border-white/[0.08] dark:bg-neutral-900/80 dark:hover:border-white/[0.15]"
              >
                {/* Gradient border glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-sm" />
                </div>

                {/* Top accent line */}
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {repo.isPrivate && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-yellow-100 dark:bg-yellow-500/10">
                          <Lock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        </span>
                      )}
                      {repo.isFork && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-100 dark:bg-white/[0.06]">
                          <GitFork className="h-3 w-3 text-neutral-500" />
                        </span>
                      )}
                    </div>
                    {/* Audit button */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileHover={{ scale: 1.1 }}
                      className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    >
                      {auditingRepo === repo.fullName ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Audit
                      <ArrowUpRight className="h-3 w-3" />
                    </motion.div>
                  </div>

                  {/* Repo name */}
                  <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {repo.name}
                  </h3>

                  {/* Description */}
                  {repo.description && (
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-neutral-500">
                      {repo.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    {repo.language && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: languageColors[repo.language] || "#6b7280" }}
                        />
                        <span className="font-medium">{repo.language}</span>
                      </span>
                    )}
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{repo.stars}</span>
                      </span>
                    )}
                    <span className="ml-auto text-neutral-400">
                      {new Date(repo.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
