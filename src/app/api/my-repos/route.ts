import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Fetch authenticated user's GitHub repositories.
 * Uses the access token stored in the JWT session (no database needed).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Access token is stored in the session via JWT callback
    const accessToken = (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "No GitHub token found. Please sign in again." }, { status: 401 });
    }

    // Fetch user's repos from GitHub
    const res = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=50&type=all",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "github-health-auditor/1.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch repos (${res.status})` }, { status: res.status });
    }

    const repos = await res.json();

    const formatted = repos.map((repo: {
      name: string;
      full_name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      private: boolean;
      updated_at: string;
      html_url: string;
      fork: boolean;
    }) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      url: repo.html_url,
      isFork: repo.fork,
    }));

    return NextResponse.json({ repos: formatted });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
