"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/Navbar";
import './globals.css'; // Add this line
import Sidebar from "./components/Sidebar";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          <div className="flex">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
