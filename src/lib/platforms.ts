/**
 * Multi-platform support — GitHub and GitLab.
 * Detects platform from URL and routes to the correct API.
 */

export type Platform = "github" | "gitlab";

export interface RepoIdentifier {
  platform: Platform;
  owner: string;
  repo: string;
  fullPath: string; // For GitLab nested groups
}

export function detectPlatform(url: string): RepoIdentifier {
  const trimmed = url.trim().replace(/\.git$/, "");

  // GitLab
  if (trimmed.includes("gitlab.com")) {
    const match = trimmed.match(/gitlab\.com\/(.+)/);
    if (match) {
      const parts = match[1].split("/");
      if (parts.length >= 2) {
        return {
          platform: "gitlab",
          owner: parts[0],
          repo: parts[parts.length - 1],
          fullPath: match[1],
        };
      }
    }
    throw new Error("Invalid GitLab URL");
  }

  // GitHub (default)
  const patterns = [
    /github\.com\/([^/]+)\/([^/.\s]+)/,
    /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        platform: "github",
        owner: match[1],
        repo: match[2],
        fullPath: `${match[1]}/${match[2]}`,
      };
    }
  }

  throw new Error("Invalid repository URL. Supports GitHub and GitLab.");
}

export function getPlatformLabel(platform: Platform): string {
  return platform === "github" ? "GitHub" : "GitLab";
}

export function getPlatformIcon(platform: Platform): string {
  return platform === "github" ? "🐙" : "🦊";
}
