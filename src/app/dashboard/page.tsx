// app/dashboard/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

export default function DashboardPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session?.user?.email}!</p>
    <LogoutButton />
    </div>
  );
}