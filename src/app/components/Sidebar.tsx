"use client";

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
      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-800/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-md shadow-xl p-5 transition-transform duration-300 ease-in-out z-40 mt-20
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Navigation Links */}
        <nav className="space-y-4 mt-8">
          <SidebarLink href="/auth/login" text="🔒 Login" />
          <SidebarLink href="/auth/register" text="📝 Register" />
          <SidebarLink href="/settings/enable-2fa" text="🛡️ Enable 2FA" />
          <SidebarLink href="/reset-password/request" text="📩 Reset Password" />
          <SidebarLink href="/docs" text="📚 Docs" />
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
