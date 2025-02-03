// app/dashboard/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/login");
    },
  });

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, {session?.user?.name}!</p>
        <p className="mb-4">Email: {session?.user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}