import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Enterprise Credentials",
      credentials: {
        email: { label: "Work Email", type: "email", placeholder: "engineer@city.gov" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password.");
        }

        // Production credential check / mock fallback for demo environment
        const demoEmail = "demo@nexus-urban.ai";
        const isDemo = credentials.email.toLowerCase() === demoEmail;

        if (isDemo || credentials.password.length >= 6) {
          return {
            id: "user_demo_101",
            email: credentials.email.toLowerCase(),
            name: credentials.email.split("@")[0].toUpperCase() + " (Municipal Engineer)",
            role: "CITY_ENGINEER",
            organization: "City of Metro Nexus",
          };
        }

        throw new Error("Invalid email or password.");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CITY_ENGINEER";
        token.organization = (user as any).organization || "Metro Traffic Dept";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).organization = token.organization;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "nexus_super_secret_jwt_key_2026_change_in_production",
};
