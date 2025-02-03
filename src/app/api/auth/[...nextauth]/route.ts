// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db"; //Your MongoDB client file
import User from "../../../models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider(
    {
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

        // Compare the password
        const isValid = await bcrypt.compare(credentials?.password || "", user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return the user object if valid
        return { id: user._id, email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };