// app/login/page.tsx
"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/dashboard",
    });

    if (result?.error) {
      alert(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-32 bg-gray-400 p-20 w-96 rounded-lg mx-auto">
      <h1 className="text-4xl mb-5">Login</h1>
      <form className="flex flex-col justify-center items-center mb-5 " onSubmit={handleSubmit}>
        <input className="mb-5 p-2 rounded-lg" type="email" name="email" placeholder="Email" required />
        <input className="mb-5 p-2 rounded-lg" type="password" name="password" placeholder="Password" required />
        <button className="bg-gray-800 text-white  rounded-lg px-4 py-1" type="submit">Login</button>
      </form>
      <p>
        Dont have an account? <br/><Link href="/register">Register here</Link>
      </p>
    </div>
  );
}