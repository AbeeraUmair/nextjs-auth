import { NextResponse } from "next/server";
import { generateSecret } from "node-2fa";
import User from "@/app/models/User";
import connectDB from "@/lib/db";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth.config";

export async function POST(req: Request) {
  try {
    // Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    await connectDB();
    const { userId } = await req.json();
    
    console.log("Received userId:", userId);

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required" 
      }, { status: 400 });
    }

    const user = await User.findById(userId);
    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }

    // Generate new secret
    const newSecret = generateSecret({
      name: "AuthFlow",
      account: user.email
    });

    if (!newSecret || !newSecret.secret) {
      return NextResponse.json({ 
        error: "Failed to generate 2FA secret" 
      }, { status: 500 });
    }

    try {
      // Generate QR code as data URL
      const otpauthUrl = `otpauth://totp/AuthFlow:${user.email}?secret=${newSecret.secret}&issuer=AuthFlow`;
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

      // Save secret to user (but mark as unverified)
      user.twoFactorSecret = newSecret.secret;
      user.twoFactorEnabled = false;
      await user.save();

      return NextResponse.json({ 
        qr: qrCodeDataUrl,
        message: "2FA setup initiated successfully" 
      });
    } catch (qrError) {
      console.error("QR Code Generation Error:", qrError);
      return NextResponse.json({ 
        error: "Failed to generate QR code" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json({ 
      error: "Internal server error during 2FA setup" 
    }, { status: 500 });
  }
} 