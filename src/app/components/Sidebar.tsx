"use client";
import { IoClose } from "react-icons/io5";
import { RiMenu2Fill } from "react-icons/ri";
import Link from "next/link";

export default function Sidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <div className="relative">
      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-5 left-5 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <IoClose /> : <RiMenu2Fill />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 z-40 md:hidden"
          onClick={toggleSidebar} // Close sidebar when clicked outside
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-md shadow-xl p-5 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Auth Navigation</h2>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <SidebarLink href="/auth/login" text="🔒 Login" />
          <SidebarLink href="/auth/register" text="📝 Register" />
          <SidebarLink href="settings/enable-2fa" text="🛡️ Enable 2FA" />
          <SidebarLink href="/settings/verify-otp" text="🔑 Verify OTP" />
          <SidebarLink href="/reset-password/request" text="📩 Reset Password" />
        </nav>
      </div>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ href, text }: { href: string; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
    >
      <span className="text-gray-800 font-medium">{text}</span>
    </Link>
  );
}
