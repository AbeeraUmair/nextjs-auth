// app/api/auth/reset-password/confirm/route.ts 

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/User";
import  connectDB  from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, newPassword } = await req.json();
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });

    if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error}, { status: 500 });
  }
}
