/**
 * GitHub API Client for server-side usage
 */

const GITHUB_API = "https://api.github.com";

interface FetchOptions {
  token?: string;
}

async function githubFetch(endpoint: string, options: FetchOptions = {}) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "github-health-auditor/1.0",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${GITHUB_API}${endpoint}`;

  const res = await fetch(url, { headers, next: { revalidate: 300 } });

  if (res.status === 404) throw new Error("Repository not found");
  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      throw new Error("GitHub API rate limit exceeded. Try again later or provide a token.");
    }
    throw new Error("Access forbidden. Check token permissions.");
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  return res.json();
}

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  // Sanitize input
  const sanitized = url.trim().slice(0, 500);
  
  const patterns = [
    /github\.com\/([^/]+)\/([^/.\s]+)/,
    /github\.com:([^/]+)\/([^/.\s]+)/,
    /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = sanitized.replace(/\.git$/, "").match(pattern);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      // Validate owner/repo contain only safe characters
      if (/^[a-zA-Z0-9_.-]+$/.test(owner) && /^[a-zA-Z0-9_.-]+$/.test(repo)) {
        return { owner, repo };
      }
    }
  }

  throw new Error("Invalid GitHub repository URL");
}

export async function getRepo(owner: string, repo: string, token?: string) {
  return githubFetch(`/repos/${owner}/${repo}`, { token });
}

export async function getCommits(owner: string, repo: string, since: string, token?: string) {
  return githubFetch(
    `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
    { token }
  );
}

export async function getPullRequests(owner: string, repo: string, state: string, token?: string) {
  return githubFetch(
    `/repos/${owner}/${repo}/pulls?state=${state}&sort=updated&direction=desc&per_page=30`,
    { token }
  );
}

export async function getIssues(owner: string, repo: string, token?: string) {
  return githubFetch(
    `/repos/${owner}/${repo}/issues?state=all&sort=created&direction=desc&per_page=30`,
    { token }
  );
}

export async function getIssueComments(owner: string, repo: string, issueNumber: number, token?: string) {
  return githubFetch(
    `/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=1`,
    { token }
  );
}

export async function getContents(owner: string, repo: string, path: string, token?: string) {
  return githubFetch(`/repos/${owner}/${repo}/contents/${path}`, { token });
}

export async function getFileContent(owner: string, repo: string, path: string, token?: string) {
  const data = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, { token });
  if (data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return null;
}

export async function getWorkflows(owner: string, repo: string, token?: string) {
  return githubFetch(`/repos/${owner}/${repo}/actions/workflows`, { token });
}
