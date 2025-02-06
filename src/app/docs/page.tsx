"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, Suspense } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DocsSidebar from '../components/DocsSidebar';
import { HiMenu } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';


const proseClasses = `
  prose 
  prose-headings:scroll-mt-16 
  prose-headings:font-semibold 
  prose-h1:text-3xl md:prose-h1:text-4xl
  prose-h1:mb-8 
  prose-h2:text-xl md:prose-h2:text-2xl
  prose-h2:mt-8 md:prose-h2:mt-10 
  prose-h2:mb-4
  prose-h3:text-lg md:prose-h3:text-xl
  prose-p:text-gray-600 
  prose-pre:bg-gray-800 
  prose-pre:shadow-lg
  prose-code:text-pink-500 
  prose-code:before:content-none 
  prose-code:after:content-none
  prose-a:text-blue-600 
  prose-a:no-underline 
  prose-a:font-semibold
  max-w-none
`;

const codeBlockClasses = "my-6 rounded-lg shadow-lg";

function DocsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'getting-started';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const installationCode = `npm install authflow
# or
yarn add authflow`;

  const envSetupCode = `MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_id_here
GOOGLE_CLIENT_SECRET=your_secret_here
GITHUB_CLIENT_ID=your_id_here
GITHUB_CLIENT_SECRET=your_secret_here`;

  const basicSetupCode = `import { AuthFlow } from 'authflow';

export default function App({ Component, pageProps }) {
  return (
    <AuthFlow>
      <Component {...pageProps} />
    </AuthFlow>
  );}`;

  const authSetupCode = `// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/app/models/User";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text", optional: true }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`;

  const registerCode = `// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "../../../models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

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
}`;

  const enable2FACode = `// app/api/auth/enable-2fa/route.ts
import { NextResponse } from "next/server";
import { generateSecret } from "node-2fa";
import User from "@/app/models/User";
import connectDB from "@/lib/db";
import QRCode from "qrcode";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    await connectDB();
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required" 
      }, { status: 400 });
    }

    const user = await User.findById(userId);

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

    // Generate QR code and save secret
    const otpauthUrl = \`otpauth://totp/AuthFlow:\${user.email}?secret=\${newSecret.secret}&issuer=AuthFlow\`;
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    user.twoFactorSecret = newSecret.secret;
    user.twoFactorEnabled = false;
    await user.save();

    return NextResponse.json({ 
      qr: qrCodeDataUrl,
      message: "2FA setup initiated successfully" 
    });
  } catch (error) {
    console.error("2FA Setup Error:", error);
    return NextResponse.json({ 
      error: "Internal server error during 2FA setup" 
    }, { status: 500 });
  }
}`;

  const resetPasswordCode = `// app/api/auth/reset-password/request/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/app/models/User";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const user = await User.findOne({ email });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    return NextResponse.json({ 
      message: "Password reset link sent to email", 
      token: resetToken 
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}`;

  const loginComponentCode = `import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    });
  };

  return (
    // Your login form
  );
}`;

  const twoFactorSetupCode = `// Enable 2FA
const setup2FA = async () => {
  const response = await fetch('/api/auth/enable-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: session.user.id }),
  });
  const data = await response.json();
  // Handle QR code display
};`;

  const passwordResetCode = `// Request password reset
const requestReset = async (email) => {
  await fetch('/api/auth/reset-password/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
};`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              >
                <HiMenu className="h-6 w-6" />
              </button>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2 md:ml-0">
                AuthFlow
              </span>
              </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/AbeeraUmair/nextjs-auth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FaGithub className="w-5 h-5" />
                <span className="hidden md:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

    

            {/* Content Area */}
            <div className="flex-1">
            <div className={`${proseClasses} px-0 sm:px-4 md:px-6`}>
              {activeTab === 'introduction' && (
                <div>
                  <h1 className="text-4xl font-bold">Introduction</h1>
                  <p>Welcome to AuthFlow - a comprehensive authentication solution for Next.js applications.</p>
                </div>
              )}

              {activeTab === 'getting-started' && (
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-8">Getting Started with AuthFlow</h1>
                  
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Quick Setup</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          AuthFlow is a comprehensive authentication solution for Next.js applications. 
                          It provides secure user authentication with features like OAuth, Two-Factor Authentication, 
                          and Password Reset functionality.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-4">1. Project Creation</h3>
                          <p className="text-gray-700 mb-4">
                            Start by creating a new Next.js project with TypeScript and Tailwind CSS support.
                            This command sets up your project with the latest Next.js features.
                          </p>
                          <SyntaxHighlighter>
                            {`npx create-next-app@latest my-app --typescript --tailwind --app`}
                          </SyntaxHighlighter>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-4">2. Dependencies Installation</h3>
                          <p className="text-gray-700 mb-4">
                            Install the required packages for authentication, database connectivity, 
                            and security features.
                          </p>
                          <SyntaxHighlighter>
                            {`npm install next-auth@latest mongoose bcryptjs node-2fa qrcode`}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Environment Configuration</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Configure your environment variables to securely manage authentication settings 
                          and database connections. Create a <code>.env.local</code> file in your project root.
                        </p>
                      </div>
                  <SyntaxHighlighter language="bash" style={tomorrow}>
                        {`# .env.local

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Email Configuration (for password reset)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com`}
                      </SyntaxHighlighter>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-medium mb-3">Authentication</h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Email/Password authentication</li>
                            <li>OAuth providers (Google, GitHub)</li>
                            <li>JWT session handling</li>
                            <li>Secure password hashing</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-medium mb-3">Security Features</h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Two-Factor Authentication (2FA)</li>
                            <li>Password reset functionality</li>
                            <li>Rate limiting protection</li>
                            <li>CSRF protection</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Next Steps</h2>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-700 mb-4">
                          After completing the initial setup, you can:
                        </p>
                        <ul className="list-decimal list-inside space-y-2 text-gray-700">
                          <li>Configure OAuth providers</li>
                          <li>Set up Two-Factor Authentication</li>
                          <li>Customize the authentication UI</li>
                          <li>Implement protected routes</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'authentication' && (
                <div>
                  <h1 className="text-4xl font-bold">Authentication</h1>
                  
                  <h2>Setup Authentication</h2>
                  <p>Configure NextAuth.js with AuthFlow provider:</p>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {authSetupCode}
                  </SyntaxHighlighter>

                  <h2>Login Component</h2>
                  <p>Create a login component using NextAuth.js:</p>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {loginComponentCode}
                  </SyntaxHighlighter>

                  <h2>Protected Routes</h2>
                  <p>Use the following middleware to protect your routes:</p>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {`export { default } from "next-auth/middleware"

export const config = { matcher: ["/protected/:path*"] }`}
                  </SyntaxHighlighter>
                </div>
              )}

              {activeTab === 'auth-setup' && (
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-8">Basic Authentication</h1>
                  
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Authentication Setup</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Configure NextAuth.js with credentials provider for email/password authentication.
                        </p>
                      </div>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/app/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  }
});

export { handler as GET, handler as POST };`}
                      </SyntaxHighlighter>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">User Registration</h2>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    await connectDB();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}`}
                      </SyntaxHighlighter>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === '2fa-setup' && (
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-8">Two-Factor Authentication</h1>
                  
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Enable 2FA</h2>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/2fa/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { generateSecret, verifyToken } from "node-2fa";
import QRCode from "qrcode";
import User from "@/app/models/User";

// Enable 2FA
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate 2FA secret
    const { secret, qr } = generateSecret({
      name: "AuthFlow",
      account: user.email,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(qr);

    // Save secret temporarily
    user.tempTwoFactorSecret = secret;
    await user.save();

    return NextResponse.json({
      qrCode: qrCodeUrl,
      message: "2FA setup initiated"
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}

// Verify and Enable 2FA
export async function PUT(req: Request) {
  try {
    const { token } = await req.json();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user?.tempTwoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not initiated" },
        { status: 400 }
      );
    }

    // Verify the token
    const result = verifyToken(user.tempTwoFactorSecret, token);
    if (!result || result.delta !== 0) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Enable 2FA
    user.twoFactorSecret = user.tempTwoFactorSecret;
    user.twoFactorEnabled = true;
    user.tempTwoFactorSecret = undefined;
    await user.save();

    return NextResponse.json({
      message: "2FA enabled successfully"
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}

// Verify 2FA Token (for login)
export async function PATCH(req: Request) {
  try {
    const { email, token } = await req.json();
    
    const user = await User.findOne({ email });
    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not enabled" },
        { status: 400 }
      );
    }

    const result = verifyToken(user.twoFactorSecret, token);
    if (!result || result.delta !== 0) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "2FA verification successful"
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}

// Disable 2FA
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    await user.save();

    return NextResponse.json({
      message: "2FA disabled successfully"
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    );
  }
}`}
                      </SyntaxHighlighter>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Verify 2FA Setup</h2>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/verify-2fa/route.ts
import { NextResponse } from "next/server";
import { verifyToken } from "node-2fa";
import connectDB from "@/lib/db";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const { userId, token } = await req.json();
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Invalid setup" },
        { status: 400 }
      );
    }

    const result = verifyToken(user.twoFactorSecret, token);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      message: "2FA enabled successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error verifying 2FA" },
      { status: 500 }
    );
  }
}`}
                      </SyntaxHighlighter>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'password-reset' && (
                <div>
                  <h1 className="text-4xl font-bold">Password Reset</h1>
                  
                  <h2>Request Reset</h2>
                  <p>Implement password reset functionality:</p>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {passwordResetCode}
                  </SyntaxHighlighter>

                  <h2>Reset Password</h2>
                  <p>Handle password reset confirmation:</p>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {`const resetPassword = async (token, newPassword) => {
  await fetch('/api/auth/reset-password/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
};`}
                  </SyntaxHighlighter>
                </div>
              )}

              {activeTab === 'oauth' && (
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-8">OAuth Providers</h1>
                  
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Google OAuth</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Google OAuth enables users to sign in using their Google accounts. 
                          This provides a secure and convenient authentication method while 
                          reducing the friction of user registration.
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Required Setup:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Create project in Google Cloud Console</li>
                            <li>Enable OAuth consent screen</li>
                            <li>Configure authorized domains</li>
                            <li>Set up OAuth credentials</li>
                          </ol>
                        </div>
                      </div>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/[...nextauth]/route.ts
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile.email_verified && profile.email?.endsWith("@gmail.com")
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};`}
                      </SyntaxHighlighter>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">GitHub OAuth</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          GitHub OAuth allows developers to sign in using their GitHub accounts. 
                          This is particularly useful for developer-focused applications and 
                          provides access to basic GitHub profile information.
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Required Setup:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-gray-700">
                            <li>Register OAuth application in GitHub</li>
                            <li>Configure callback URLs</li>
                            <li>Set permissions and scopes</li>
                            <li>Obtain client credentials</li>
                          </ol>
                        </div>
                      </div>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// app/api/auth/[...nextauth]/route.ts
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        // You can add custom logic here
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};`}
                      </SyntaxHighlighter>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'register' && (
                <div>
                  <h1 className="text-4xl font-bold">User Registration</h1>
                  <p>
                    The registration system handles new user creation with secure password 
                    hashing and duplicate email checking.
                  </p>

                  <h2>Registration API Route</h2>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {registerCode}
                  </SyntaxHighlighter>

                  <h3>Implementation Details:</h3>
                  <ul>
                    <li>Automatic MongoDB connection handling</li>
                    <li>Password hashing using bcrypt</li>
                    <li>Duplicate email validation</li>
                    <li>Error handling and status codes</li>
                  </ul>

                  <h2>Usage Example</h2>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {`// In your registration component
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error);
  }
  return data;
}`}
                  </SyntaxHighlighter>
                </div>
              )}

              {activeTab === 'reset-flow' && (
                <div>
                  <h1 className="text-4xl font-bold">Password Reset Flow</h1>
                  <p>
                    The password reset system allows users to securely reset their 
                    passwords using time-limited tokens.
                  </p>

                  <h2>Password Reset Request</h2>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {resetPasswordCode}
                  </SyntaxHighlighter>

                  <h3>Security Features:</h3>
                  <ul>
                    <li>Cryptographically secure tokens</li>
                    <li>15-minute expiration time</li>
                    <li>One-time use tokens</li>
                    <li>Secure error handling</li>
                  </ul>

                  <h2>Implementation Example</h2>
                  <SyntaxHighlighter 
                    language="typescript" 
                    style={tomorrow}
                    className={codeBlockClasses}
                    customStyle={{
                      padding: "1.5rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {`// In your password reset component
const requestPasswordReset = async (email: string) => {
  try {
    const response = await fetch('/api/auth/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    
    // Handle success (e.g., show confirmation message)
  } catch (error) {
    // Handle error
  }
}`}
                  </SyntaxHighlighter>
                </div>
              )}

              {activeTab === 'api-auth' && (
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-8">API Endpoints</h1>
                  
                  <div className="space-y-12">
                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Authentication Endpoints</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Core authentication endpoints handle user registration, login, and session management. 
                          All endpoints use secure HTTPS and implement rate limiting for protection.
                        </p>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Login Endpoint:</h4>
                            <p className="text-gray-700">Handles user authentication with optional 2FA support.</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Registration Endpoint:</h4>
                            <p className="text-gray-700">Creates new user accounts with secure password hashing.</p>
                          </div>
                        </div>
                      </div>
                      <SyntaxHighlighter language="typescript" style={tomorrow}>
                        {`// API Routes Overview

// 1. Authentication Endpoints
POST /api/auth/login
{
  email: string;
  password: string;
  totpCode?: string; // Required if 2FA is enabled
}

POST /api/auth/register
{
  name: string;
  email: string;
  password: string;
}

// 2. Session Management
GET /api/auth/session
POST /api/auth/signout

// 3. Password Management
POST /api/auth/reset-password/request
{
  email: string;
}

POST /api/auth/reset-password/confirm
{
  token: string;
  newPassword: string;
}

// 4. Two-Factor Authentication
POST /api/auth/enable-2fa
{
  userId: string;
}

POST /api/auth/verify-2fa
{
  userId: string;
  token: string;
}

// Example Implementation
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Protected route logic
  return NextResponse.json({
    user: session.user,
    message: "Authenticated successfully"
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    // Handle POST request logic

    return NextResponse.json({
      message: "Operation successful",
      data: data
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}`}
                      </SyntaxHighlighter>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Password Management</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Secure endpoints for password reset functionality. Implements time-limited 
                          tokens and secure reset flows.
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Security Features:</h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Time-limited reset tokens</li>
                            <li>Secure email notifications</li>
                            <li>Rate limiting protection</li>
                            <li>Password strength validation</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-semibold mb-6">Two-Factor Authentication</h2>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          Endpoints for managing 2FA setup and verification. Uses TOTP (Time-based 
                          One-Time Password) for secure second-factor authentication.
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Available Operations:</h4>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Enable/Disable 2FA</li>
                            <li>Generate QR codes</li>
                            <li>Verify TOTP tokens</li>
                            <li>Manage backup codes</li>
                          </ul>
                        </div>
                      </div>
              
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'api-2fa' && (
                <div className="prose max-w-none">
                  <h1>Two-Factor Authentication API</h1>
                  
                  <h2>Enable 2FA</h2>
                  <p>Initiates 2FA setup and generates QR code.</p>
                  <SyntaxHighlighter language="typescript" style={tomorrow}>
                    {`// POST /api/auth/enable-2fa
${enable2FACode}

// Request Body
{
  userId: string
}

// Success Response
{
  qr: string,  // QR code data URL
  message: "2FA setup initiated successfully"
}

// Error Response
{
  error: "Unauthorized" | "User not found" | "Failed to generate QR code"
}`}
                  </SyntaxHighlighter>

                  <h2>Verify 2FA Setup</h2>
                  <p>Verifies and completes 2FA setup.</p>
                  <SyntaxHighlighter language="typescript" style={tomorrow}>
                    {`POST /api/auth/verify-2fa-setup

// Request Body
{
  userId: string,
  token: string
}

// Success Response
{
  message: "2FA enabled successfully"
}

// Error Response
{
  error: "Invalid token" | "User not found"
}`}
                  </SyntaxHighlighter>
                </div>
              )}

              {activeTab === 'api-password' && (
                <div className="prose max-w-none">
                  <h1>Password Management API</h1>
                  
                  <h2>Request Password Reset</h2>
                  <p>Initiates the password reset process.</p>
                  <SyntaxHighlighter language="typescript" style={tomorrow}>
                    {`// POST /api/auth/reset-password/request
${resetPasswordCode}

// Request Body
{
  email: string
}

// Success Response
{
  message: "Password reset link sent to email",
  token: string
}

// Error Response
{
  error: "User not found" | "Internal Server Error"
}`}
                  </SyntaxHighlighter>

                  <h2>Confirm Password Reset</h2>
                  <p>Completes the password reset process.</p>
                  <SyntaxHighlighter language="typescript" style={tomorrow}>
                    {`POST /api/auth/reset-password/confirm

// Request Body
{
  token: string,
  newPassword: string
}

// Success Response
{
  message: "Password reset successfully"
}

// Error Response
{
  error: "Invalid or expired token" | "Reset failed"
}`}
                  </SyntaxHighlighter>

                  <h2>Security Considerations</h2>
                  <ul>
                    <li>All endpoints require HTTPS in production</li>
                    <li>Rate limiting is recommended for security endpoints</li>
                    <li>Token expiration is set to 15 minutes</li>
                    <li>Password complexity requirements should be enforced</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
    
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsContent />
    </Suspense>
  );
} 