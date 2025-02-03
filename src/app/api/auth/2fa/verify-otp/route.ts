import { NextResponse } from "next/server";
import User from "@/app/models/User";
import  connectDB  from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });

    if (!user) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

    user.otp = undefined;
    user.otpExpires = undefined;
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({ message: "OTP verified, 2FA enabled!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error:error}, { status: 500 });
  }
}
