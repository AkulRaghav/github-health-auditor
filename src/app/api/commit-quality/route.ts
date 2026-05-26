import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl } from "@/lib/github";
import { analyzeCommitQuality } from "@/lib/commit-quality";

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, token } = await request.json();
    if (!repoUrl) return NextResponse.json({ error: "Repository URL required" }, { status: 400 });

    const { owner, repo } = parseRepoUrl(repoUrl);
    const result = await analyzeCommitQuality(owner, repo, token || undefined);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
