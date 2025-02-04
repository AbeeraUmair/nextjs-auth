"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || ""; // Ensure token is a string
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const res = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold">Set New Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        className="w-full p-2 border rounded my-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleReset} className="w-full bg-blue-600 text-white py-2 rounded">
        Reset Password
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
