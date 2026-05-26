"use client";

import { useState, useMemo } from "react";
import { Search, Loader2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditFormProps {
  onSubmit: (repoUrl: string, token?: string) => void;
  isLoading: boolean;
}

function detectPlatformLabel(url: string): { label: string; icon: string } | null {
  if (!url.trim()) return null;
  if (url.includes("gitlab")) return { label: "GitLab", icon: "🦊" };
  if (url.includes("github") || /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(url.trim())) return { label: "GitHub", icon: "🐙" };
  return null;
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const platform = useMemo(() => detectPlatformLabel(repoUrl), [repoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onSubmit(repoUrl.trim(), token.trim() || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-none dark:focus-within:border-white/[0.2] dark:focus-within:ring-0">
          <div className="flex items-center pl-5">
            {platform ? (
              <span className="text-lg" title={platform.label}>{platform.icon}</span>
            ) : (
              <GitBranch className="h-5 w-5 text-neutral-400" />
            )}
          </div>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="github.com/owner/repo or gitlab.com/group/project"
            className="flex-1 bg-transparent px-4 py-5 text-foreground placeholder-neutral-400 outline-none dark:placeholder-neutral-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !repoUrl.trim()}
            className={cn(
              "mr-2 flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-300",
              isLoading || !repoUrl.trim()
                ? "cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-white/[0.05] dark:text-neutral-500"
                : "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-400 hover:to-rose-400 hover:shadow-lg hover:shadow-orange-500/20 dark:from-cyan-500 dark:to-blue-600 dark:hover:from-cyan-400 dark:hover:to-blue-500 dark:hover:shadow-cyan-500/20"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? "Auditing..." : "Audit"}
          </button>
        </div>
      </div>

    </form>
  );
}
