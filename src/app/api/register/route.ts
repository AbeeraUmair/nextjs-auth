// app/api/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "../../models/User";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  await connectDB();

  // Check if the user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Create a new user
  const newUser = new User({ email, password });
  await newUser.save();

  return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
}