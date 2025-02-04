// app/models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Basic Info
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required']
  },
  
  // Profile Info
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Account Verification
  verified: { 
    type: Boolean, 
    default: false 
  },
  verificationToken: String,
  verificationTokenExpires: Date,

  // Password Reset
  resetToken: String,
  resetTokenExpires: Date,

  // 2FA Authentication
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: String,
  backupCodes: [String], // For 2FA backup codes

  // OAuth
  provider: { 
    type: String, 
    enum: ['credentials', 'google', 'github'],
    default: 'credentials' 
  },
  providerId: String, // ID from OAuth provider

  // Login History
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Account Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  }
}, { 
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users' // Explicitly name the collection
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ providerId: 1 });
userSchema.index({ resetToken: 1 });
userSchema.index({ verificationToken: 1 });

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetToken;
  delete obj.resetTokenExpires;
  delete obj.twoFactorSecret;
  delete obj.backupCodes;
  return obj;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;