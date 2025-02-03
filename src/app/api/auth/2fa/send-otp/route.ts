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

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`Generated OTP: ${otp} for email: ${email}`); // Debugging

    // Return OTP to frontend for EmailJS
    return NextResponse.json({ otp }, { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
