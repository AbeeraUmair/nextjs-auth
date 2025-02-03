// /api/auth/reset-password/request/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/app/models/User";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const user = await User.findOne({ email });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 minutes

    // Save token in DB
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    return NextResponse.json({ message: "Password reset link sent to email", token: resetToken }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
