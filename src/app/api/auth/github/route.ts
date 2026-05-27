import { NextResponse } from "next/server";

/**
 * Direct GitHub OAuth redirect — bypasses NextAuth CSRF issues on Vercel.
 * Constructs the GitHub OAuth URL manually and redirects.
 */
export async function GET() {
  const clientId = process.env.GITHUB_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || "https://github-health-auditor.vercel.app"}/api/auth/callback/github`;
  
  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    response_type: "code",
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
