// app/layout.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar/>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}