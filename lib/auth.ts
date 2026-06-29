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
      if (account?.access_token) {
        token.accessToken = account.access_token;

        // O setor (department) e o cargo (jobTitle) normalmente não vêm
        // no token OIDC básico. Buscamos via Microsoft Graph para que o
        // controle de acesso por setor/cargo funcione de verdade.
        try {
          const res = await fetch(
            "https://graph.microsoft.com/v1.0/me?$select=department,jobTitle,displayName,mail",
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          );
          if (res.ok) {
            const me = (await res.json()) as Record<string, unknown>;
            token.department = (me.department as string) ?? undefined;
            token.jobTitle = (me.jobTitle as string) ?? undefined;
          }
        } catch {
          // Sem Graph disponível, mantém o que vier do profile OIDC.
          const p = (profile ?? {}) as Record<string, unknown>;
          token.department = (p.department as string) ?? token.department;
          token.jobTitle = (p.job_title as string) ?? token.jobTitle;
        }
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
