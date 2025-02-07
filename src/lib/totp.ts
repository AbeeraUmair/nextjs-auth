// import { authenticator } from 'otplib';

// export enum HashAlgorithms {
//   SHA1 = "sha1",
//   SHA256 = "sha256",
//   SHA512 = "sha512",
// }

// // Now use it safely:
// authenticator.options = {
//   algorithm: HashAlgorithms.SHA1, // Type-safe assignment
//   step: 30,
//   digits: 6,
//   window: 2
// }; 
// export function generateTOTPSecret() {
//   return authenticator.generateSecret()
// }

// export function generateTOTPUri(secret: string, accountName: string, issuer: string) {
//   // Ensure proper encoding of special characters
//   const encodedAccount = encodeURIComponent(accountName)
//   const encodedIssuer = encodeURIComponent(issuer)
//   return authenticator.keyuri(encodedAccount, encodedIssuer, secret)
// }

// export function verifyTOTP(token: string, secret: string): boolean {
//   try {
//     console.log("Verifying TOTP:", { 
//       token, 
//       secret,
//       currentTime: Math.floor(Date.now() / 1000),
//       timeStep: authenticator.options.step,
//       window: authenticator.options.window
//     })
    
//     const isValid = authenticator.check(token, secret)
//     console.log("TOTP verification result:", isValid)
//     return isValid
//   } catch (error) {
//     console.error("TOTP verification error:", error)
//     return false
//   }
// } 

// /lib/totp.ts 
import { authenticator } from "otplib"
import { encode as base32Encode } from "hi-base32"

export enum HashAlgorithms {
  SHA1 = "sha1",
  SHA256 = "sha256",
  SHA512 = "sha512",
}

// Configure the authenticator
authenticator.options = {
  algorithm: HashAlgorithms.SHA1,
  step: 30,
  digits: 6,
  window: 2,
}

export function generateTOTPSecret() {
  // Generate a random buffer of 20 bytes (160 bits)
  const buffer = crypto.getRandomValues(new Uint8Array(20))
  // Convert to Base32 string and remove padding
  return base32Encode(buffer).replace(/=/g, "")
}

export function generateTOTPUri(secret: string, accountName: string, issuer: string) {
  // Ensure proper encoding of special characters
  const encodedAccount = encodeURIComponent(accountName)
  const encodedIssuer = encodeURIComponent(issuer)

  // Log the components for debugging
  console.log("TOTP URI Components:", {
    secret,
    encodedAccount,
    encodedIssuer,
    algorithm: authenticator.options.algorithm,
    digits: authenticator.options.digits,
    step: authenticator.options.step,
  })

  const uri = authenticator.keyuri(encodedAccount, encodedIssuer, secret)
  console.log("Generated URI:", uri)
  return uri
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    // Ensure token is exactly 6 digits
    if (!/^\d{6}$/.test(token)) {
      console.log("Invalid token format")
      return false
    }

    const currentTime = Math.floor(Date.now() / 1000)
    console.log("Verifying TOTP:", {
      token,
      secret,
      currentTime,
      timeStep: authenticator.options.step,
      window: authenticator.options.window,
    })

    // Generate current valid tokens for debugging
    const validTokens = []
    const window = authenticator.options.window as number;
    for (let i = -window; i <= window; i++) {
      validTokens.push(authenticator.generate(secret))
    }
    console.log("Valid tokens in current window:", validTokens)

    const isValid = authenticator.check(token, secret)
    console.log("TOTP verification result:", isValid)
    return isValid
  } catch (error) {
    console.error("TOTP verification error:", error)
    return false
  }
}

