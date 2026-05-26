"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { CategoryResult } from "@/lib/analyzers";

interface CategoryCardProps {
  name: string;
  icon: string;
  result: CategoryResult;
  index: number;
}

export default function CategoryCard({ name, icon, result, index }: CategoryCardProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple CSS-driven animation with delay based on index
    const timer = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${result.score}%`;
      }
    }, 100 + index * 80);
    return () => clearTimeout(timer);
  }, [result.score, index]);

  const color = result.score >= 80 ? "from-green-500 to-emerald-400"
    : result.score >= 60 ? "from-yellow-500 to-amber-400"
    : result.score >= 40 ? "from-orange-500 to-orange-400"
    : "from-red-500 to-rose-400";

  const textColor = result.score >= 80 ? "text-green-400"
    : result.score >= 60 ? "text-yellow-400"
    : result.score >= 40 ? "text-orange-400"
    : "text-red-400";

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-colors duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-semibold text-white">{name}</h3>
          </div>
          <span className={cn("text-2xl font-bold", textColor)}>
            {result.score}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            ref={barRef}
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out", color)}
            style={{ width: 0 }}
          />
        </div>

        <p className="mb-4 text-sm text-neutral-400">{result.details}</p>

        {/* Findings */}
        <div className="space-y-1.5">
          {result.findings.slice(0, 4).map((finding, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 flex-shrink-0">
                {finding.type === "success" && <span className="text-green-400">✓</span>}
                {finding.type === "info" && <span className="text-blue-400">ℹ</span>}
                {finding.type === "warning" && <span className="text-yellow-400">⚠</span>}
                {finding.type === "error" && <span className="text-red-400">✗</span>}
              </span>
              <span className="text-neutral-300">{finding.message}</span>
            </div>
          ))}
          {result.findings.length > 4 && (
            <p className="text-xs text-neutral-500">+{result.findings.length - 4} more findings</p>
          )}
        </div>
      </div>
    </div>
  );
}
