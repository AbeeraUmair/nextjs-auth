// /app/api/auth/enable-2fa/route.ts 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";
import User from "@/app/models/User";
import {  generateTOTPUri } from "@/lib/totp";
import QRCode from "qrcode";
import connectDB from "@/lib/db";
import speakeasy from "speakeasy";

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
    // const secret = generateTOTPSecret();
    // console.log("Generated new secret:", secret);
    const secret = speakeasy.generateSecret({ length: 20 }); // Generates a Base32 secret
console.log("TOTP Secret (Base32):", secret.base32);

    // Force update with $set
    const result = await User.updateOne(
      { _id: session.user.id },
      { 
        $set: { 
          tempTwoFactorSecret: secret.base32,
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
      secret.base32,
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