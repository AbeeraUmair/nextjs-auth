"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Enable2FAPage() {
  const [qrCode, setQrCode] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState("")
  const [message, setMessage] = useState("")
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const initiate2FASetup = async () => {
    try {
      if (!session?.user?.id) {
        setMessage("User session not found");
        return;
      }

      console.log("Sending userId:", session.user.id); // Debug log

      const response = await fetch("/api/auth/enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: session.user.id 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to setup 2FA");
      }

      if (data.qr) {
        setQrCode(data.qr);
        setMessage(data.message || "Scan this QR code with your authenticator app");
      } else {
        setMessage("No QR code received");
      }
    } catch (error: unknown) {
      console.error("2FA Setup Error:", error);
      setMessage(error instanceof Error ? error.message : "Failed to initiate 2FA setup");
    }
  }

  const verify2FASetup = async () => {
    try {
      const response = await fetch("/api/auth/verify-2fa-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          token: verificationCode,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setIsSetupComplete(true)
        setMessage("2FA enabled successfully!")
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        setMessage(data.error || "Verification failed")
      }
    } catch {
      setMessage("Failed to verify code")
    }
  }

  if (!session) {
    return <div>Please log in to enable 2FA</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Enable Two-Factor Authentication</h1>

      {!qrCode && !isSetupComplete && (
        <button
          onClick={initiate2FASetup}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Set up 2FA
        </button>
      )}

      {qrCode && !isSetupComplete && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <img
              src={qrCode}
              alt="2FA QR Code"
              width={200}
              height={200}
              style={{ margin: 'auto' }}
            />
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              1. Install Google Authenticator or any TOTP app
              <br />
              2. Scan the QR code above
              <br />
              3. Enter the 6-digit code shown in your app
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="w-full p-2 border rounded"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
            <button
              onClick={verify2FASetup}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Verify Code
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className={`mt-4 text-center ${isSetupComplete ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

