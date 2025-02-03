// /api/auth/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "../../../models/User";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    await connectDB();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
  }
}