"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import emailjs from "@emailjs/browser"

export default function Enable2FA() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleEnable2FA = async () => {
    try {
      const res = await fetch("/api/auth/2fa/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (res.status !== 200) {
        setMessage(data.error || "Error generating OTP")
        return
      }

      const emailData = {
        to_name: email.split("@")[0], // Using the part before @ as the name
        email: email,
        otp_message: `🔐 Your One-Time Password (OTP)

Use the following OTP to verify your account. This OTP will expire in 10 minutes.

${data.otp}`,
        reset_message: "",
      }

      const response = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!,
        emailData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )

      if (response.status === 200) {
        setMessage("OTP sent to your email")
        router.push("/settings/verify-otp")
      } else {
        setMessage("Failed to send OTP email")
      }
    } catch (error) {
      console.error("EmailJS Error:", error)
      setMessage("An error occurred while processing your request.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold">Enable Two-Factor Authentication</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-2 border rounded my-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleEnable2FA} className="w-full bg-blue-600 text-white py-2 rounded">
        Send OTP
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  )
}

