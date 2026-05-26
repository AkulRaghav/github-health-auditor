/**
 * AI-style natural language summary generator.
 * Produces a concise 3-sentence summary of the audit results.
 * Uses rule-based NLG (no external API dependency).
 */

import type { AuditResult } from "./analyzers";

export function generateSummary(result: AuditResult): string {
  const { overallScore, categories } = result;
  const c = categories;

  // Find strongest and weakest categories
  const sorted = Object.entries(c)
    .map(([key, val]) => ({ key, score: val.score }))
    .sort((a, b) => b.score - a.score);

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const categoryLabels: Record<string, string> = {
    commitFrequency: "commit activity",
    prMergeTime: "PR review speed",
    issueResponseTime: "issue response time",
    dependencyFreshness: "dependency management",
    testCoverage: "testing and CI/CD",
    documentation: "documentation",
    security: "security practices",
  };

  // Sentence 1: Overall assessment
  let sentence1: string;
  if (overallScore >= 85) {
    sentence1 = `This repository demonstrates excellent engineering practices with an overall health score of ${overallScore}/100.`;
  } else if (overallScore >= 70) {
    sentence1 = `This repository is in good health (${overallScore}/100) with solid fundamentals and some areas for growth.`;
  } else if (overallScore >= 55) {
    sentence1 = `This repository has moderate health (${overallScore}/100) with a mix of strengths and areas needing attention.`;
  } else if (overallScore >= 40) {
    sentence1 = `This repository needs improvement (${overallScore}/100) — several critical areas require immediate attention.`;
  } else {
    sentence1 = `This repository has significant health concerns (${overallScore}/100) and requires substantial investment to meet engineering standards.`;
  }

  // Sentence 2: Strengths and weaknesses
  let sentence2: string;
  if (strongest.score >= 80 && weakest.score < 50) {
    sentence2 = `Its strongest area is ${categoryLabels[strongest.key]} (${strongest.score}/100), while ${categoryLabels[weakest.key]} (${weakest.score}/100) is the most critical gap.`;
  } else if (strongest.score >= 70) {
    sentence2 = `${categoryLabels[strongest.key].charAt(0).toUpperCase() + categoryLabels[strongest.key].slice(1)} is a standout strength at ${strongest.score}/100, though ${categoryLabels[weakest.key]} could use improvement at ${weakest.score}/100.`;
  } else {
    sentence2 = `Most categories score below 70, with ${categoryLabels[weakest.key]} being the weakest at ${weakest.score}/100.`;
  }

  // Sentence 3: Top recommendation
  let sentence3: string;
  if (c.testCoverage.score < 40) {
    sentence3 = "Priority recommendation: Set up CI/CD with automated testing — this has the highest impact on overall health.";
  } else if (c.security.score < 40) {
    sentence3 = "Priority recommendation: Address security gaps by adding a SECURITY.md, reviewing exposed files, and enabling vulnerability scanning.";
  } else if (c.documentation.score < 40) {
    sentence3 = "Priority recommendation: Improve documentation with a comprehensive README including installation, usage examples, and contribution guidelines.";
  } else if (c.dependencyFreshness.score < 50) {
    sentence3 = "Priority recommendation: Set up Dependabot or Renovate for automated dependency updates and add a lock file for reproducible builds.";
  } else if (c.prMergeTime.score < 50) {
    sentence3 = "Priority recommendation: Reduce PR merge time by adding more reviewers, enabling auto-merge for passing PRs, or implementing CODEOWNERS.";
  } else if (overallScore >= 80) {
    sentence3 = "The repository follows strong engineering practices — continue maintaining these standards and consider mentoring other projects.";
  } else {
    sentence3 = `Focus on improving ${categoryLabels[weakest.key]} to raise the overall health score most effectively.`;
  }

  return `${sentence1} ${sentence2} ${sentence3}`;
}
