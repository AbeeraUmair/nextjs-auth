// app/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  provider: { type: String, default: 'credentials' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;