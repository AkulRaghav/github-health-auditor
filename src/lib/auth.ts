import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      // On initial sign in, save the access token and profile info
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.sub || account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass access token to the client session
      (session as any).accessToken = token.accessToken;
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export function auth() {
  return getServerSession(authOptions);
}
