"use client";
import { useState } from "react";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    const res = await fetch("/api/auth/2fa/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold">Verify OTP</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-2 border rounded my-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter OTP"
        className="w-full p-2 border rounded my-2"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerify} className="w-full bg-green-600 text-white py-2 rounded">
        Verify OTP
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
