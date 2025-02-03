"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Use the hook

  const email = searchParams.get("email"); // ✅ Extract email safely

  const verifyEmail = async () => {
    if (!email) {
      setError("Invalid email address.");
      return;
    }

    try {
      const res = await fetch(`/api/auth/verify?email=${email}`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setVerified(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(data.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("🔴 Verification Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
      {verified ? (
        <p className="text-green-500">Your email has been verified. Redirecting to login...</p>
      ) : error ? (
        <p className="text-red-500 mb-4">{error}</p>
      ) : (
        <>
          {email ? (
            <p className="mb-4">Click the button below to verify your email: {email}</p>
          ) : (
            <p className="mb-4 text-red-500">No email found in the URL.</p>
          )}
          <button
            onClick={verifyEmail}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Verify Email
          </button>
        </>
      )}
    </div>
  );
}
