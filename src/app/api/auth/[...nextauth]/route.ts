// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "../../../models/User";
import { verifyToken } from "node-2fa";
import type { Account, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { AuthOptions } from "next-auth";
import type { User as NextAuthUser } from "next-auth";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
          if (!credentials.totpCode) {
            throw new Error("2FA_REQUIRED");
          }

          const isValidToken = verifyToken(
            user.twoFactorSecret,
            credentials.totpCode
          );

          if (!isValidToken || isValidToken.delta !== 0) {
            throw new Error("Invalid 2FA code");
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ 
      account, 
      profile 
    }: { 
      account: Account | null; 
      profile?: Profile | undefined;
    }) {
      await connectDB();
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await User.findOne({ email: profile?.email });
        if (!existingUser) {
          await User.create({
            name: profile?.name,
            email: profile?.email,
            password: "",
            verified: true,
            provider: account.provider,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };