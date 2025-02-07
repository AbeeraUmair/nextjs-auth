import { NextResponse } from "next/server"
import User from "@/app/models/User"
import { verifyTOTP } from "@/lib/totp"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import connectDB from "@/lib/db"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      )
    }

    // Get the user with temporary secret
    const user = await User.findById(session.user.id);
    console.log("Verification attempt details:", {
      userId: user?._id,
      hasUser: !!user,
      tempSecretExists: !!user?.tempTwoFactorSecret,
      tempSecret: user?.tempTwoFactorSecret,
      token: token,
      tokenLength: token.length,
      tokenType: typeof token
    });

    if (!user?.tempTwoFactorSecret) {
      return NextResponse.json(
        { error: "2FA setup not initiated. Please start setup again." },
        { status: 400 }
      )
    }

    // Clean the token and secret
    // const cleanToken = token.replace(/\s/g, '');
    // const cleanSecret = user.tempTwoFactorSecret.replace(/\s/g, '');

    // Verify the token
    // const isValid = verifyTOTP(cleanToken, cleanSecret);
    const isValid = verifyTOTP(token, user.tempTwoFactorSecret);
    console.log("Token verification details:", {
      originalToken: token,
      originalSecret: user.tempTwoFactorSecret,
      isValid
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update 2FA status
    user.twoFactorEnabled = true;
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    console.log("Retrieved secret:", user.tempTwoFactorSecret);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA setup" },
      { status: 500 }
    );
  }
}