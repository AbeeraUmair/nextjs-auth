// /app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import User from "@/app/models/User";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { verified: true } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in Verification API:", error);
    return NextResponse.json({ error: "An error occurred during verification" }, { status: 500 });
  }
}