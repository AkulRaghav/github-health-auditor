/**
 * Commit Message Quality Analyzer
 * Scores conventional commits compliance, message length, and clarity.
 */

import { getCommits } from "./github";

export interface CommitQualityResult {
  score: number;
  conventionalRate: number;
  avgLength: number;
  findings: Array<{ type: "success" | "info" | "warning" | "error"; message: string }>;
  examples: { good: string[]; bad: string[] };
}

const CONVENTIONAL_PATTERN = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?:\s.+/;

export async function analyzeCommitQuality(owner: string, repo: string, token?: string): Promise<CommitQualityResult> {
  const findings: Array<{ type: "success" | "info" | "warning" | "error"; message: string }> = [];
  let score = 0;

  const since = new Date();
  since.setDate(since.getDate() - 90);
  const commits = await getCommits(owner, repo, since.toISOString(), token);

  if (commits.length === 0) {
    return { score: 50, conventionalRate: 0, avgLength: 0, findings: [{ type: "info", message: "No recent commits to analyze" }], examples: { good: [], bad: [] } };
  }

  const messages = commits.map((c: { commit: { message: string } }) => c.commit.message.split("\n")[0]);

  // Conventional commits check
  const conventional = messages.filter((m: string) => CONVENTIONAL_PATTERN.test(m));
  const conventionalRate = conventional.length / messages.length;

  if (conventionalRate >= 0.8) { score += 40; findings.push({ type: "success", message: `${(conventionalRate * 100).toFixed(0)}% follow Conventional Commits` }); }
  else if (conventionalRate >= 0.5) { score += 25; findings.push({ type: "info", message: `${(conventionalRate * 100).toFixed(0)}% follow Conventional Commits` }); }
  else if (conventionalRate >= 0.2) { score += 15; findings.push({ type: "warning", message: `Only ${(conventionalRate * 100).toFixed(0)}% follow Conventional Commits` }); }
  else { score += 5; findings.push({ type: "warning", message: "Conventional Commits not adopted" }); }

  // Message length analysis
  const lengths = messages.map((m: string) => m.length);
  const avgLength = lengths.reduce((a: number, b: number) => a + b, 0) / lengths.length;

  if (avgLength >= 20 && avgLength <= 72) { score += 25; findings.push({ type: "success", message: `Good avg length: ${avgLength.toFixed(0)} chars` }); }
  else if (avgLength >= 10 && avgLength <= 100) { score += 15; findings.push({ type: "info", message: `Avg length: ${avgLength.toFixed(0)} chars` }); }
  else if (avgLength < 10) { score += 5; findings.push({ type: "error", message: `Very short messages: ${avgLength.toFixed(0)} chars avg` }); }
  else { score += 10; findings.push({ type: "warning", message: `Long messages: ${avgLength.toFixed(0)} chars avg (keep under 72)` }); }

  // Check for low-quality patterns
  const lowQuality = messages.filter((m: string) => /^(fix|update|wip|test|asdf|temp|stuff|changes|\.)+$/i.test(m.trim()));
  const lowQualityRate = lowQuality.length / messages.length;

  if (lowQualityRate === 0) { score += 20; findings.push({ type: "success", message: "No low-quality commit messages detected" }); }
  else if (lowQualityRate < 0.1) { score += 15; findings.push({ type: "info", message: `${lowQuality.length} vague messages (${(lowQualityRate * 100).toFixed(0)}%)` }); }
  else if (lowQualityRate < 0.3) { score += 8; findings.push({ type: "warning", message: `${lowQuality.length} vague messages like "fix", "update", "wip"` }); }
  else { score += 3; findings.push({ type: "error", message: `${(lowQualityRate * 100).toFixed(0)}% of commits have vague messages` }); }

  // Capitalization consistency
  const capitalized = messages.filter((m: string) => /^[A-Z]/.test(m) || CONVENTIONAL_PATTERN.test(m));
  if (capitalized.length / messages.length > 0.7) { score += 15; findings.push({ type: "success", message: "Consistent message capitalization" }); }
  else { score += 5; findings.push({ type: "info", message: "Inconsistent capitalization in messages" }); }

  // Collect examples
  const good = conventional.slice(0, 3);
  const bad = lowQuality.slice(0, 3);

  return {
    score: Math.min(100, Math.max(0, score)),
    conventionalRate: +(conventionalRate * 100).toFixed(0),
    avgLength: +avgLength.toFixed(0),
    findings,
    examples: { good, bad },
  };
}
