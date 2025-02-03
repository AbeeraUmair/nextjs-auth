// app/auth/login/page.tsx
"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="w-full p-2 border rounded-lg" type="email" name="email" placeholder="Email" required />
          <input className="w-full p-2 border rounded-lg" type="password" name="password" placeholder="Password" required />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors" type="submit">Login</button>
        </form>
        <div className="mt-4 space-y-2">
          <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
            Sign in with Google
          </button>
          <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors">
            Sign in with GitHub
          </button>
        </div>
        <p className="mt-4 text-center">
          Dont have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}