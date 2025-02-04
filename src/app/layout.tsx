"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "./components/Navbar";
import './globals.css';
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
          <Navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex pt-24">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="flex-1 p-6 md:ml-64">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
