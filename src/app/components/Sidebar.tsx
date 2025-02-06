"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import DocsSidebar from "./DocsSidebar";
import { useRouter, useSearchParams } from 'next/navigation';

function SidebarContent({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const [showDocsSidebar, setShowDocsSidebar] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'getting-started';

  const handleTabChange = (tabId: string) => {
    router.push(`/docs?tab=${tabId}`);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

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
        className={`fixed top-0 left-0 h-full w-64 bg-white/80 backdrop-blur-md shadow-xl transition-transform duration-300 ease-in-out z-40 mt-20
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Add overflow container */}
        <div className="h-full overflow-y-auto hover:overflow-y-auto scrollbar-none">
          <nav className="space-y-4 p-5">
            <div onClick={() => setShowDocsSidebar(!showDocsSidebar)} className="cursor-pointer">
              <SidebarLink href="#" text="📚 Docs " />
            </div>
            
            {/* Nested DocsSidebar */}
            {showDocsSidebar && (
              <div className="ml-4 mt-2 space-y-2">
                <DocsSidebar 
                  activeTab={activeTab} 
                  setActiveTab={handleTabChange} 
                />
              </div>
            )}

            <SidebarLink href="/auth/login" text="🔒 Login" />
            <SidebarLink href="/auth/register" text="📝 Register" />
            <SidebarLink href="/settings/enable-2fa" text="🛡️ Enable 2FA" />
            <SidebarLink href="/reset-password/request" text="📩 Reset Password" />
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: { isOpen: boolean; toggleSidebar: () => void }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarContent {...props} />
    </Suspense>
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
