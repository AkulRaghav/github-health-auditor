import {
  getCommits,
  getPullRequests,
  getIssues,
  getIssueComments,
  getContents,
  getFileContent,
  getWorkflows,
  getRepo,
} from "./github";

export interface Finding {
  type: "success" | "info" | "warning" | "error";
  message: string;
}

export interface CategoryResult {
  score: number;
  details: string;
  findings: Finding[];
  metrics: Record<string, unknown>;
}

export interface AuditResult {
  owner: string;
  repo: string;
  repoUrl: string;
  timestamp: string;
  overallScore: number;
  grade: string;
  categories: {
    commitFrequency: CategoryResult;
    prMergeTime: CategoryResult;
    issueResponseTime: CategoryResult;
    dependencyFreshness: CategoryResult;
    testCoverage: CategoryResult;
    documentation: CategoryResult;
    security: CategoryResult;
  };
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

// ─── COMMIT FREQUENCY ────────────────────────────────────────────────────────

async function analyzeCommits(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const commits = await getCommits(owner, repo, since.toISOString(), token);
  const totalCommits = commits.length;
  const commitsPerWeek = totalCommits / 13;

  if (commitsPerWeek >= 10) {
    score = 100;
    findings.push({ type: "success", message: `Very active: ${commitsPerWeek.toFixed(1)} commits/week` });
  } else if (commitsPerWeek >= 5) {
    score = 85;
    findings.push({ type: "success", message: `Active: ${commitsPerWeek.toFixed(1)} commits/week` });
  } else if (commitsPerWeek >= 2) {
    score = 70;
    findings.push({ type: "info", message: `Moderate activity: ${commitsPerWeek.toFixed(1)} commits/week` });
  } else if (commitsPerWeek >= 0.5) {
    score = 50;
    findings.push({ type: "warning", message: `Low activity: ${commitsPerWeek.toFixed(1)} commits/week` });
  } else if (totalCommits > 0) {
    score = 30;
    findings.push({ type: "warning", message: `Very low activity: ${commitsPerWeek.toFixed(1)} commits/week` });
  } else {
    score = 10;
    findings.push({ type: "error", message: "No commits in the last 90 days" });
  }

  const authors = new Set<string>();
  commits.forEach((c: { author?: { login: string } }) => {
    if (c.author) authors.add(c.author.login);
  });

  if (authors.size > 5) {
    score = Math.min(100, score + 5);
    findings.push({ type: "success", message: `${authors.size} active contributors` });
  } else if (authors.size > 1) {
    findings.push({ type: "info", message: `${authors.size} contributors in last 90 days` });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: `${totalCommits} commits in 90 days (${commitsPerWeek.toFixed(1)}/week)`,
    findings,
    metrics: { totalCommits, commitsPerWeek: +commitsPerWeek.toFixed(1), contributors: authors.size },
  };
}

// ─── PR MERGE TIME ───────────────────────────────────────────────────────────

async function analyzePRs(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;

  const closedPRs = await getPullRequests(owner, repo, "closed", token);
  const openPRs = await getPullRequests(owner, repo, "open", token);

  if (closedPRs.length === 0 && openPRs.length === 0) {
    return {
      score: 50,
      details: "No pull requests found",
      findings: [{ type: "info", message: "No PR workflow detected" }],
      metrics: { avgMergeTimeHours: null, mergedCount: 0 },
    };
  }

  const mergedPRs = closedPRs.filter((pr: { merged_at: string | null }) => pr.merged_at);
  const mergeTimes = mergedPRs.map((pr: { created_at: string; merged_at: string }) => {
    return (new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60);
  });

  const avgMergeTime = mergeTimes.length > 0
    ? mergeTimes.reduce((a: number, b: number) => a + b, 0) / mergeTimes.length
    : null;

  if (avgMergeTime !== null) {
    if (avgMergeTime <= 4) { score = 100; findings.push({ type: "success", message: `Excellent: ${avgMergeTime.toFixed(1)}h avg merge` }); }
    else if (avgMergeTime <= 24) { score = 85; findings.push({ type: "success", message: `Good: ${avgMergeTime.toFixed(1)}h avg merge` }); }
    else if (avgMergeTime <= 72) { score = 70; findings.push({ type: "info", message: `Moderate: ${(avgMergeTime / 24).toFixed(1)}d avg merge` }); }
    else if (avgMergeTime <= 168) { score = 50; findings.push({ type: "warning", message: `Slow: ${(avgMergeTime / 24).toFixed(1)}d avg merge` }); }
    else { score = 30; findings.push({ type: "error", message: `Very slow: ${(avgMergeTime / 24).toFixed(1)}d avg merge` }); }
  }

  const now = new Date();
  const stalePRs = openPRs.filter((pr: { created_at: string }) => {
    return (now.getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60 * 24) > 30;
  });

  if (stalePRs.length > 0) {
    score = Math.max(0, score - 10);
    findings.push({ type: "warning", message: `${stalePRs.length} stale PRs (open > 30 days)` });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: avgMergeTime ? `Avg merge: ${avgMergeTime < 24 ? avgMergeTime.toFixed(1) + "h" : (avgMergeTime / 24).toFixed(1) + "d"}` : "No merged PRs",
    findings,
    metrics: { avgMergeTimeHours: avgMergeTime, mergedCount: mergedPRs.length, stalePRs: stalePRs.length },
  };
}

// ─── ISSUE RESPONSE TIME ─────────────────────────────────────────────────────

async function analyzeIssues(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;

  const issues = await getIssues(owner, repo, token);
  const realIssues = issues.filter((i: { pull_request?: unknown }) => !i.pull_request);

  if (realIssues.length === 0) {
    return {
      score: 60,
      details: "No issues found",
      findings: [{ type: "info", message: "No issues tracked in this repository" }],
      metrics: { avgResponseTimeHours: null, totalIssues: 0 },
    };
  }

  const sample = realIssues.slice(0, 8);
  const responseTimes: number[] = [];

  for (const issue of sample) {
    try {
      const comments = await getIssueComments(owner, repo, issue.number, token);
      if (comments.length > 0 && comments[0].user?.login !== issue.user?.login) {
        const hours = (new Date(comments[0].created_at).getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60);
        responseTimes.push(hours);
      }
    } catch { /* skip */ }
  }

  const avg = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : null;

  if (avg !== null) {
    if (avg <= 4) { score = 100; findings.push({ type: "success", message: `Excellent response: ${avg.toFixed(1)}h avg` }); }
    else if (avg <= 24) { score = 85; findings.push({ type: "success", message: `Good response: ${avg.toFixed(1)}h avg` }); }
    else if (avg <= 72) { score = 65; findings.push({ type: "info", message: `Moderate response: ${(avg / 24).toFixed(1)}d avg` }); }
    else if (avg <= 168) { score = 45; findings.push({ type: "warning", message: `Slow response: ${(avg / 24).toFixed(1)}d avg` }); }
    else { score = 25; findings.push({ type: "error", message: `Very slow response: ${(avg / 24).toFixed(1)}d avg` }); }
  } else {
    score = 40;
    findings.push({ type: "warning", message: "Could not determine response times" });
  }

  const closedRate = realIssues.filter((i: { state: string }) => i.state === "closed").length / realIssues.length;
  if (closedRate > 0.7) {
    score = Math.min(100, score + 10);
    findings.push({ type: "success", message: `High close rate: ${(closedRate * 100).toFixed(0)}%` });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: avg ? `Avg response: ${avg < 24 ? avg.toFixed(1) + "h" : (avg / 24).toFixed(1) + "d"}` : "Response time unknown",
    findings,
    metrics: { avgResponseTimeHours: avg, totalIssues: realIssues.length },
  };
}

// ─── DEPENDENCY FRESHNESS ────────────────────────────────────────────────────

async function analyzeDeps(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;
  let totalDeps = 0;
  let issues = 0;

  let pkgJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; engines?: unknown; scripts?: Record<string, string> } | null = null;
  try {
    const content = await getFileContent(owner, repo, "package.json", token);
    if (content) pkgJson = JSON.parse(content);
  } catch { /* no package.json */ }

  if (!pkgJson) {
    // Try other ecosystems
    try {
      await getContents(owner, repo, "requirements.txt", token);
      findings.push({ type: "info", message: "Python project detected" });
      return { score: 60, details: "Python project (basic check)", findings, metrics: { totalDeps: 0 } };
    } catch { /* */ }
    try {
      await getContents(owner, repo, "go.mod", token);
      findings.push({ type: "info", message: "Go project detected" });
      return { score: 60, details: "Go project (basic check)", findings, metrics: { totalDeps: 0 } };
    } catch { /* */ }

    return {
      score: 50,
      details: "No dependency file found",
      findings: [{ type: "info", message: "No recognized package manager detected" }],
      metrics: { totalDeps: 0 },
    };
  }

  const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  totalDeps = Object.keys(deps).length;
  findings.push({ type: "info", message: `${totalDeps} npm dependencies` });

  // Check for wildcards
  const wildcards = Object.entries(deps).filter(([, v]) => v === "*" || v === "latest");
  if (wildcards.length > 0) {
    issues += wildcards.length;
    findings.push({ type: "warning", message: `${wildcards.length} deps use wildcard/latest` });
  }

  // Check deprecated packages
  const deprecated = ["request", "node-uuid", "nomnom", "coffee-script"];
  const foundDep = Object.keys(deps).filter((d) => deprecated.includes(d));
  if (foundDep.length > 0) {
    issues += foundDep.length;
    findings.push({ type: "warning", message: `Deprecated: ${foundDep.join(", ")}` });
  }

  if (pkgJson.engines) findings.push({ type: "success", message: "Engine constraints defined" });

  // Lock file check
  let hasLock = false;
  for (const lockFile of ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]) {
    try { await getContents(owner, repo, lockFile, token); hasLock = true; break; } catch { /* */ }
  }
  if (hasLock) { score += 20; findings.push({ type: "success", message: "Lock file present" }); }
  else findings.push({ type: "warning", message: "No lock file found" });

  // Dependabot/Renovate
  try { await getContents(owner, repo, ".github/dependabot.yml", token); score += 10; findings.push({ type: "success", message: "Dependabot configured" }); }
  catch {
    try { await getContents(owner, repo, "renovate.json", token); score += 10; findings.push({ type: "success", message: "Renovate configured" }); }
    catch { findings.push({ type: "info", message: "No automated dependency updates" }); }
  }

  const ratio = totalDeps > 0 ? issues / totalDeps : 0;
  if (ratio === 0) score += 70;
  else if (ratio < 0.1) score += 60;
  else if (ratio < 0.25) score += 45;
  else score += 30;

  return {
    score: Math.min(100, Math.max(0, score)),
    details: `${totalDeps} deps, ${issues} issues found`,
    findings,
    metrics: { totalDeps, issues, hasLock },
  };
}

// ─── TEST COVERAGE & CI ──────────────────────────────────────────────────────

async function analyzeTests(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;

  // GitHub Actions
  let hasCI = false;
  try {
    const workflows = await getWorkflows(owner, repo, token);
    if (workflows.workflows?.length > 0) {
      hasCI = true;
      score += 30;
      findings.push({ type: "success", message: `${workflows.workflows.length} GitHub Actions workflow(s)` });
      const testWf = workflows.workflows.filter((w: { name: string }) => /test|ci|build/i.test(w.name));
      if (testWf.length > 0) { score += 10; findings.push({ type: "success", message: `CI workflows: ${testWf.map((w: { name: string }) => w.name).join(", ")}` }); }
    }
  } catch { /* */ }

  // Other CI
  if (!hasCI) {
    for (const ci of [".travis.yml", ".circleci/config.yml", "Jenkinsfile", ".gitlab-ci.yml"]) {
      try { await getContents(owner, repo, ci, token); hasCI = true; score += 30; findings.push({ type: "success", message: `CI config found: ${ci}` }); break; } catch { /* */ }
    }
  }

  if (!hasCI) findings.push({ type: "error", message: "No CI/CD configuration detected" });

  // Test directories
  for (const dir of ["tests", "test", "__tests__", "spec"]) {
    try { await getContents(owner, repo, dir, token); score += 20; findings.push({ type: "success", message: `${dir}/ directory found` }); break; } catch { /* */ }
  }

  // Test frameworks in package.json
  try {
    const content = await getFileContent(owner, repo, "package.json", token);
    if (content) {
      const pkg = JSON.parse(content);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const frameworks = Object.keys(allDeps).filter((d) =>
        ["jest", "mocha", "vitest", "ava", "cypress", "playwright", "pytest"].some((f) => d.includes(f))
      );
      if (frameworks.length > 0) { score += 15; findings.push({ type: "success", message: `Test frameworks: ${frameworks.join(", ")}` }); }

      if (pkg.scripts?.test && !pkg.scripts.test.includes("no test specified")) {
        score += 10;
        findings.push({ type: "success", message: "Test script configured" });
      }
    }
  } catch { /* */ }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: hasCI ? "CI/CD configured" : "No CI/CD detected",
    findings,
    metrics: { hasCI },
  };
}

// ─── DOCUMENTATION ───────────────────────────────────────────────────────────

async function analyzeDocs(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 0;

  const repoInfo = await getRepo(owner, repo, token);

  if (repoInfo.description) { score += 5; findings.push({ type: "success", message: "Repository description set" }); }
  if (repoInfo.topics?.length > 0) { score += 5; findings.push({ type: "success", message: `${repoInfo.topics.length} topic tags` }); }
  if (repoInfo.homepage) { score += 5; findings.push({ type: "success", message: "Homepage URL set" }); }

  // README
  let readme: string | null = null;
  for (const f of ["README.md", "readme.md", "README.rst"]) {
    try { readme = await getFileContent(owner, repo, f, token); if (readme) break; } catch { /* */ }
  }

  if (!readme) {
    findings.push({ type: "error", message: "No README file found" });
    return { score: Math.max(0, score), details: "No README", findings, metrics: { readmeLength: 0 } };
  }

  const len = readme.length;
  if (len > 5000) { score += 20; findings.push({ type: "success", message: "Comprehensive README (5000+ chars)" }); }
  else if (len > 2000) { score += 15; findings.push({ type: "success", message: "Good README (2000+ chars)" }); }
  else if (len > 500) { score += 10; findings.push({ type: "info", message: "Basic README" }); }
  else { score += 5; findings.push({ type: "warning", message: "Very short README" }); }

  // Sections
  const sections = [
    { pattern: /#{1,3}\s*(install|getting started|setup)/i, name: "Installation", pts: 10 },
    { pattern: /#{1,3}\s*(usage|examples?|api)/i, name: "Usage/Examples", pts: 10 },
    { pattern: /#{1,3}\s*(contribut)/i, name: "Contributing", pts: 5 },
    { pattern: /#{1,3}\s*(license)/i, name: "License", pts: 3 },
    { pattern: /#{1,3}\s*(test)/i, name: "Testing", pts: 5 },
  ];

  for (const s of sections) {
    if (s.pattern.test(readme)) { score += s.pts; findings.push({ type: "success", message: `Has ${s.name} section` }); }
  }

  if (readme.includes("```")) { score += 5; findings.push({ type: "success", message: "Code examples in README" }); }

  // License
  if (repoInfo.license) { score += 5; findings.push({ type: "success", message: `License: ${repoInfo.license.name}` }); }
  else findings.push({ type: "warning", message: "No license detected" });

  // CONTRIBUTING.md
  try { await getContents(owner, repo, "CONTRIBUTING.md", token); score += 5; findings.push({ type: "success", message: "CONTRIBUTING.md present" }); } catch { /* */ }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: `README: ${len} chars, ${findings.filter((f) => f.type === "success").length} quality indicators`,
    findings,
    metrics: { readmeLength: len },
  };
}

// ─── SECURITY ────────────────────────────────────────────────────────────────

async function analyzeSecurity(owner: string, repo: string, token?: string): Promise<CategoryResult> {
  const findings: Finding[] = [];
  let score = 70;

  // .gitignore
  try {
    const gi = await getFileContent(owner, repo, ".gitignore", token);
    if (gi) {
      score += 5;
      findings.push({ type: "success", message: ".gitignore present" });
      const sensitive = [".env", "node_modules", "*.key", "*.pem"];
      const covered = sensitive.filter((p) => gi.includes(p));
      if (covered.length >= 3) { score += 5; findings.push({ type: "success", message: "Good .gitignore coverage" }); }
    }
  } catch {
    score -= 10;
    findings.push({ type: "warning", message: "No .gitignore file" });
  }

  // Exposed secrets
  for (const f of [".env", ".env.local", "credentials.json"]) {
    try { await getContents(owner, repo, f, token); score -= 20; findings.push({ type: "error", message: `EXPOSED: ${f} committed to repo` }); } catch { /* good */ }
  }

  // Security policy
  try { await getContents(owner, repo, "SECURITY.md", token); score += 10; findings.push({ type: "success", message: "SECURITY.md present" }); }
  catch {
    try { await getContents(owner, repo, ".github/SECURITY.md", token); score += 10; findings.push({ type: "success", message: "Security policy present" }); }
    catch { findings.push({ type: "info", message: "No SECURITY.md (recommended)" }); }
  }

  // CodeQL
  try { await getContents(owner, repo, ".github/workflows/codeql.yml", token); score += 5; findings.push({ type: "success", message: "CodeQL analysis configured" }); }
  catch {
    try { await getContents(owner, repo, ".github/workflows/codeql-analysis.yml", token); score += 5; findings.push({ type: "success", message: "CodeQL configured" }); }
    catch { /* */ }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    details: `${findings.filter((f) => f.type === "error").length} issues, ${findings.filter((f) => f.type === "success").length} good practices`,
    findings,
    metrics: {
      issues: findings.filter((f) => f.type === "error").length,
      goodPractices: findings.filter((f) => f.type === "success").length,
    },
  };
}

// ─── MAIN AUDIT ORCHESTRATOR ─────────────────────────────────────────────────

export async function runAudit(owner: string, repo: string, token?: string): Promise<AuditResult> {
  const [commitFrequency, prMergeTime, issueResponseTime, dependencyFreshness, testCoverage, documentation, security] =
    await Promise.all([
      analyzeCommits(owner, repo, token).catch((e) => errorResult(e)),
      analyzePRs(owner, repo, token).catch((e) => errorResult(e)),
      analyzeIssues(owner, repo, token).catch((e) => errorResult(e)),
      analyzeDeps(owner, repo, token).catch((e) => errorResult(e)),
      analyzeTests(owner, repo, token).catch((e) => errorResult(e)),
      analyzeDocs(owner, repo, token).catch((e) => errorResult(e)),
      analyzeSecurity(owner, repo, token).catch((e) => errorResult(e)),
    ]);

  const categories = { commitFrequency, prMergeTime, issueResponseTime, dependencyFreshness, testCoverage, documentation, security };

  const weights: Record<string, number> = {
    commitFrequency: 0.15, prMergeTime: 0.15, issueResponseTime: 0.10,
    dependencyFreshness: 0.15, testCoverage: 0.20, documentation: 0.15, security: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const cat = categories[key as keyof typeof categories];
    weightedSum += cat.score * weight;
    totalWeight += weight;
  }

  const overallScore = Math.round(weightedSum / totalWeight);

  return {
    owner,
    repo,
    repoUrl: `https://github.com/${owner}/${repo}`,
    timestamp: new Date().toISOString(),
    overallScore,
    grade: getGrade(overallScore),
    categories,
  };
}

function errorResult(e: unknown): CategoryResult {
  const msg = e instanceof Error ? e.message : "Unknown error";
  return { score: 0, details: `Error: ${msg}`, findings: [{ type: "error", message: msg }], metrics: {} };
}
