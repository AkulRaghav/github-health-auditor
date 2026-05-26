/**
 * GitLab API Client — basic support for public GitLab repos.
 */

const GITLAB_API = "https://gitlab.com/api/v4";

async function gitlabFetch(endpoint: string, token?: string) {
  const headers: Record<string, string> = { "User-Agent": "github-health-auditor/1.0" };
  if (token) headers["PRIVATE-TOKEN"] = token;

  const res = await fetch(`${GITLAB_API}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`GitLab API error: ${res.status}`);
  return res.json();
}

export async function getGitLabProject(fullPath: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  return gitlabFetch(`/projects/${encoded}`, token);
}

export async function getGitLabCommits(fullPath: string, since: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  return gitlabFetch(`/projects/${encoded}/repository/commits?since=${since}&per_page=100`, token);
}

export async function getGitLabMergeRequests(fullPath: string, state: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  return gitlabFetch(`/projects/${encoded}/merge_requests?state=${state}&per_page=30&order_by=updated_at`, token);
}

export async function getGitLabIssues(fullPath: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  return gitlabFetch(`/projects/${encoded}/issues?per_page=30&order_by=created_at&sort=desc`, token);
}

export async function getGitLabFile(fullPath: string, filePath: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  const fileEncoded = encodeURIComponent(filePath);
  try {
    const data = await gitlabFetch(`/projects/${encoded}/repository/files/${fileEncoded}?ref=main`, token);
    if (data.content) return Buffer.from(data.content, "base64").toString("utf-8");
    return null;
  } catch {
    // Try master branch
    try {
      const data = await gitlabFetch(`/projects/${encoded}/repository/files/${fileEncoded}?ref=master`, token);
      if (data.content) return Buffer.from(data.content, "base64").toString("utf-8");
    } catch {}
    return null;
  }
}

export async function getGitLabPipelines(fullPath: string, token?: string) {
  const encoded = encodeURIComponent(fullPath);
  return gitlabFetch(`/projects/${encoded}/pipelines?per_page=10`, token);
}
