// app/reset-password/request/page.tsx 
"use client"
import { useState } from "react"
import emailjs from "@emailjs/browser"

export default function RequestReset() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.error) {
        setMessage(data.error)
        return
      }

      const emailData = {
        to_name: email.split("@")[0], // Using the part before @ as the name
        to_email: email,
        otp_message: "",
        reset_message: `🔐 Password Reset Request

We received a request to reset your password. If you made this request, click the button below to reset your password:

Reset Password: http://localhost:3000/reset-password/set-new-password?token=${data.token}`,
      }

      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
        emailData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )

      if (response.status === 200) {
        setMessage("Password reset link sent to your email.")
       
      } else {
        setMessage("Failed to send the reset link. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("An error occurred while processing your request.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold">Reset Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-2 border rounded my-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded">
        Send Reset Link
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  )
}

