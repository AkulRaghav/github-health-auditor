import { getServerSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  debug: process.env.NODE_ENV === "development",
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      // Attach access token to session so we can fetch user repos
      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "github" },
      });
      if (account?.access_token) {
        (session as { accessToken?: string }).accessToken = account.access_token;
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
