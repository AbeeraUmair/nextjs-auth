"use client"
import { useState } from "react";
import { useRouter } from "next/router";

export default function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { token } = router.query; // Assuming the reset token is passed as a query parameter

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password/set-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setMessage("Password reset successfully.");
        router.push("/login"); // Redirect to login page after successful reset
      } else {
        setMessage("Failed to reset password.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    }
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
      <input
        type="password"
        placeholder="Confirm new password"
        className="w-full p-2 border rounded my-2"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Set New Password
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}