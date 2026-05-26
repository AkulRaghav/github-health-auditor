"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScoreCircle from "./ScoreCircle";
import CategoryCard from "./CategoryCard";
import type { AuditResult } from "@/lib/analyzers";

interface ReportSectionProps {
  result: AuditResult & { summary?: string; shareId?: string };
}

const categoryMeta: Record<string, { name: string; icon: string }> = {
  commitFrequency: { name: "Commit Frequency", icon: "📝" },
  prMergeTime: { name: "PR Merge Time", icon: "🔀" },
  issueResponseTime: { name: "Issue Response", icon: "💬" },
  dependencyFreshness: { name: "Dependencies", icon: "📦" },
  testCoverage: { name: "Test & CI/CD", icon: "🧪" },
  documentation: { name: "Documentation", icon: "📚" },
  security: { name: "Security", icon: "🔒" },
};

export default function ReportSection({ result }: ReportSectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, { scope: headerRef });

  const recommendations = generateRecommendations(result);

  return (
    <div className="w-full">
      {/* Score Header */}
      <div ref={headerRef} className="mb-16 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-neutral-400">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Audit Complete
        </div>

        <h2 className="mb-2 text-3xl font-bold text-white md:text-4xl">
          {result.owner}/{result.repo}
        </h2>
        <p className="mb-8 text-neutral-500">
          Audited {new Date(result.timestamp).toLocaleString()}
        </p>

        <ScoreCircle score={result.overallScore} grade={result.grade} />

        <p className="mt-6 max-w-md text-neutral-400">
          {result.overallScore >= 80
            ? "This repository demonstrates strong engineering practices."
            : result.overallScore >= 60
            ? "Good foundation with room for improvement in some areas."
            : result.overallScore >= 40
            ? "Several areas need attention to improve repository health."
            : "Critical issues detected. Immediate action recommended."}
        </p>

        {/* AI Summary */}
        {result.summary && (
          <div className="mt-6 max-w-lg rounded-xl border border-neutral-200 bg-white p-4 text-left text-sm leading-relaxed text-neutral-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-neutral-300">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-neutral-400">AI Summary</span>
            {result.summary}
          </div>
        )}

        {/* PDF Export */}
        {result.shareId && (
          <a
            href={`/api/export/pdf?id=${result.shareId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.06]"
          >
            📄 Export PDF
          </a>
        )}
      </div>

      {/* Category Cards Grid */}
      <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(categoryMeta).map(([key, meta], index) => {
          const catResult = result.categories[key as keyof typeof result.categories];
          if (!catResult) return null;
          return (
            <CategoryCard
              key={key}
              name={meta.name}
              icon={meta.icon}
              result={catResult}
              index={index}
            />
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8">
          <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-white">
            <span className="text-2xl">💡</span>
            Top Recommendations
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-medium text-cyan-400">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-neutral-300">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateRecommendations(result: AuditResult): string[] {
  const recs: string[] = [];
  const c = result.categories;

  if (c.testCoverage.score < 50)
    recs.push("Set up CI/CD with GitHub Actions and add automated testing to your pipeline.");
  if (c.documentation.score < 60)
    recs.push("Improve your README with installation instructions, usage examples, and a contributing guide.");
  if (c.security.score < 60)
    recs.push("Add a SECURITY.md policy, review your .gitignore, and enable CodeQL or Snyk scanning.");
  if (c.dependencyFreshness.score < 60)
    recs.push("Configure Dependabot or Renovate for automated dependency updates and add a lock file.");
  if (c.commitFrequency.score < 50)
    recs.push("Increase commit frequency with smaller, more focused commits to show active maintenance.");
  if (c.prMergeTime.score < 50)
    recs.push("Reduce PR review time by adding CODEOWNERS, enabling auto-merge, or adding more reviewers.");
  if (c.issueResponseTime.score < 50)
    recs.push("Improve issue response time with templates, auto-labeling, and triage workflows.");

  if (recs.length === 0)
    recs.push("Excellent work! Your repository demonstrates strong engineering practices across all categories.");

  return recs.slice(0, 5);
}
