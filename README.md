# AuthFlow - Next.js Authentication System

## Overview

**AuthFlow** is a comprehensive authentication system built with Next.js 15, featuring secure user authentication, password reset functionality, and Two-Factor Authentication (2FA).

## Features

- 🔐 **User Authentication** (Login/Register)
- 📱 **Two-Factor Authentication (2FA)**
- 🔑 **Password Reset System**
- 🛡️ **Secure Session Management**
- 📧 **Email Notifications**
- 🎨 **Responsive UI with Tailwind CSS**

## Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **2FA:** node-2fa
- **Email:** EmailJS
- **Password Hashing:** bcryptjs

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       ├── enable-2fa/
│   │       ├── verify-2fa-setup/
│   │       ├── reset-password/
│   │       └── register/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MenuButton.tsx
│   │   └── LogoutButton.tsx
│   ├── models/
│   │   └── User.ts
│   ├── settings/
│   │   └── enable-2fa/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── reset-password/
│       ├── request/
│       └── set-new-password/
└── lib/
    └── db.ts
```

## Authentication Flows

### 1. Registration Flow

1. User submits registration form
2. Password is hashed using bcryptjs
3. User data is saved to MongoDB
4. Redirect to login page

### 2. Login Flow

1. User enters credentials
2. If 2FA is enabled:
   - Request 2FA code
   - Verify code using TOTP
3. Create session using NextAuth
4. Redirect to dashboard

### 3. Password Reset Flow

1. User requests password reset
2. System generates reset token
3. Email sent with reset link
4. User sets new password
5. Token invalidated after use

### 4. Two-Factor Authentication (2FA)

1. User initiates 2FA setup
2. System generates TOTP secret
3. QR code displayed for scanning
4. User verifies setup with first code
5. 2FA enabled for future logins

## API Routes

### Authentication

```typescript
POST /api/auth/register
POST /api/auth/verify
POST /api/auth/login
```

### Password Reset

```typescript
POST /api/auth/reset-password/request
POST /api/auth/reset-password/confirm
```

### Two-Factor Authentication

```typescript
POST /api/auth/enable-2fa
POST /api/auth/verify-2fa-setup
```

## Database Schema

### User Model

```typescript
{
  name: string,
  email: string,
  password: string,
  twoFactorSecret: string,
  twoFactorEnabled: boolean,
  resetToken: string,
  resetTokenExpires: Date
}
```

## Security Features

1. **Password Security**
   - Passwords hashed using bcryptjs
   - Minimum password requirements enforced

2. **2FA Security**
   - TOTP-based authentication
   - QR code for easy setup
   - Secure secret storage

3. **Session Security**
   - JWT-based sessions
   - Secure HTTP-only cookies
   - Session expiration
   
4. **Reset Token Security**
   - Time-limited tokens
   - One-time use
   - Secure token generation

## Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Google OAuth
GOOGLE_CLIENT_ID=your_id_here
GOOGLE_CLIENT_SECRET=your_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_id_here
GITHUB_CLIENT_SECRET=your_secret_here
```

## Setup Instructions

### Clone the Repository

```bash
git clone https://github.com/AbeeraUmair/nextjs-auth.git
cd nextjs-auth
```

### Install Dependencies

```bash
npm install
```

### Set Environment Variables

Create a `.env.local` file with the required variables.

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Best Practices Implemented

1. Input validation and sanitization
2. Error handling and logging
3. Rate limiting for security endpoints
4. Secure password and token generation
5. Responsive UI design
6. Type safety with TypeScript
7. Code organization and modularity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

