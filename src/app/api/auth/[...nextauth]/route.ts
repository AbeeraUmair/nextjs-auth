// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "../../../models/User";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.verified) {
          throw new Error("Please verify your email first");
        }

        const isValid = await bcrypt.compare(credentials?.password || "", user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
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
    async signIn({ account, profile }) {
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
    async jwt({ token, user }) {
      if (user && "id" in user) {
          token.id = user.id;
      } else if (user && "_id" in user) {
          token.id = (user as { _id: string })._id.toString();
      }
      return token;
  },
  async session({ session, token }) {
      if (session.user && token.id) {
          session.user.id = token.id;
      }
      console.log(session.user?.id);
      return session;
  },
},
});

export { handler as GET, handler as POST };