import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import User from "@/app/models/User";
import { generateTOTPSecret, generateTOTPUri } from "@/lib/totp";
import QRCode from "qrcode";
import connectDB from "@/lib/db";

export async function POST(): Promise<NextResponse> {
  await connectDB();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    console.log("Generated new secret:", secret);

    // Force update with $set
    const result = await User.updateOne(
      { _id: session.user.id },
      { 
        $set: { 
          tempTwoFactorSecret: secret,
          twoFactorEnabled: false 
        } 
      },
      { upsert: false, strict: true }
    );

    console.log("Update result:", result);

    // Verify save with lean() to get raw object
    const verifyUser = await User.findById(session.user.id).lean();
    if (Array.isArray(verifyUser)) {
      throw new Error("Unexpected array response");
    }

    console.log("2FA Setup Status:", {
      userId: verifyUser?._id,
      tempSecret: verifyUser?.tempTwoFactorSecret ? 'saved' : 'missing',
      actualSecret: verifyUser?.tempTwoFactorSecret,
      secretMatch: verifyUser?.tempTwoFactorSecret === secret,
      fullUser: verifyUser
    });

    if (!verifyUser?.tempTwoFactorSecret) {
      throw new Error("Failed to save secret");
    }

    // Generate QR code
    const uri = generateTOTPUri(
      secret,
      verifyUser.email || "user",
      "AuthFlow"
    );
    
    const qrCode = await QRCode.toDataURL(uri);
    console.log("Generated TOTP URI:", uri);
    return NextResponse.json({ 
      qr: qrCode,
      secret: secret
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
} 