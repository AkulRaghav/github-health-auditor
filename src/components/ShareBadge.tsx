"use client";

import { useState } from "react";
import { Copy, Check, Link, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareBadgeProps {
  shareId: string;
  owner: string;
  repo: string;
  score: number;
  grade: string;
}

export default function ShareBadge({ shareId, owner, repo, score, grade }: ShareBadgeProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/report/${shareId}`;
  const badgeUrl = `${baseUrl}/api/badge/${shareId}`;
  const markdownBadge = `[![Health Score](${badgeUrl})](${shareUrl})`;

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <Link className="h-5 w-5 text-cyan-400" />
        Share Report
      </h3>

      <div className="space-y-3">
        {/* Share URL */}
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 px-4 py-2.5">
            <p className="truncate text-sm text-neutral-300">{shareUrl}</p>
          </div>
          <button
            onClick={() => handleCopy(shareUrl, "url")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm transition-all",
              copied === "url"
                ? "bg-green-500/10 text-green-400"
                : "bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]"
            )}
          >
            {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Markdown badge */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
            <Code className="h-3 w-3" /> Markdown Badge
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 px-4 py-2.5">
              <code className="truncate text-xs text-neutral-400">{markdownBadge}</code>
            </div>
            <button
              onClick={() => handleCopy(markdownBadge, "badge")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm transition-all",
                copied === "badge"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]"
              )}
            >
              {copied === "badge" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Preview badge */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <span className="text-xs text-neutral-500">Preview:</span>
          <div className="flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-1">
            <span className="text-xs text-neutral-400">health</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-bold",
                score >= 80 ? "bg-green-600 text-white" :
                score >= 60 ? "bg-yellow-600 text-white" :
                score >= 40 ? "bg-orange-600 text-white" :
                "bg-red-600 text-white"
              )}
            >
              {score}% {grade}
            </span>
          </div>
          <span className="text-xs text-neutral-500">{owner}/{repo}</span>
        </div>
      </div>
    </div>
  );
}
