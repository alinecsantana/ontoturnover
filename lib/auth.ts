import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      department?: string;
      jobTitle?: string;
    };
  }
  interface JWT {
    accessToken?: string;
    department?: string;
    jobTitle?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID ?? "common"}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        const p = profile as Record<string, unknown>;
        token.department = p.department as string | undefined;
        token.jobTitle = p.job_title as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.department = token.department as string | undefined;
        session.user.jobTitle = token.jobTitle as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },
  trustHost: true,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
