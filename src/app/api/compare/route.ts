import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl } from "@/lib/github";
import { runAudit } from "@/lib/analyzers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl1, repoUrl2, token } = body;

    if (!repoUrl1 || !repoUrl2 || typeof repoUrl1 !== "string" || typeof repoUrl2 !== "string") {
      return NextResponse.json(
        { error: "Two valid repository URLs are required" },
        { status: 400 }
      );
    }

    if (repoUrl1.length > 500 || repoUrl2.length > 500) {
      return NextResponse.json({ error: "URL too long" }, { status: 400 });
    }

    const repo1 = parseRepoUrl(repoUrl1);
    const repo2 = parseRepoUrl(repoUrl2);

    const validToken = token && typeof token === "string" && token.length < 200 ? token : undefined;

    // Run both audits in parallel
    const [result1, result2] = await Promise.all([
      runAudit(repo1.owner, repo1.repo, validToken),
      runAudit(repo2.owner, repo2.repo, validToken),
    ]);

    return NextResponse.json({
      repo1: result1,
      repo2: result2,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
